# AI Document Tampering Detection Engine - API Specification & Architecture
**Application**: सुरक्षा साथी (Suraksha Sathi)
**Version**: 2.4.0 (Production Architecture Spec)
**Author**: Suraksha Sathi Security Architecture Group

---

## 1. Executive Summary & Forensic Pipeline

The **Suraksha Sathi AI Document Tampering Detection Module** runs automated multi-modal forensic inspection on submitted PDFs, identity scans, land titles, and financial bonds. The engine operates through four concurrent verification pipelines:

1. **Error Level Analysis (ELA)**: Re-saves the image at a known quality level (e.g. 90-95%) and evaluates pixel-difference error vectors. Altered regions compress at a distinct error scale compared to the original background substrate.
2. **Spectral Font Kerning & Glyphs OCR**: Analyzes character bounding geometry, baseline tracking, and anti-aliasing curvature to detect spliced characters or font face mismatch (e.g., Helvetica glyph inserted into an Arial table).
3. **Metadata & XMP Provenance Verification**: Inspects Exif data, creation timestamps, software history (detecting Adobe Photoshop, GIMP, Preview, Canva traces), and structural PDF object streams (`/Prev`, `/ObjStm`).
4. **On-Chain Merkle Hash Anchoring**: Re-computes keccak256 / SHA-256 hash of the canonical normalized file and cross-references the Suraksha-Chain Smart Contract (`SurakshaSathiRBAC.sol`) state for issuer signature and token ID linkage.

---

## 2. API Endpoint Specification

### `POST /api/v1/forensics/detect-tamper`

#### Request Headers:
```http
Content-Type: multipart/form-data
Authorization: Bearer <JWT_OR_DID_SESSION_TOKEN>
X-Suraksha-Client: Web3-Vault-Client/2.4
```

#### Request Body (Multipart):
| Field | Type | Description |
|---|---|---|
| `file` | Binary (PDF, JPG, PNG, TIFF) | Document to inspect (Max: 25MB) |
| `ownerDid` | String | Decentralized Identifier of the requester (e.g. `did:suraksha:in:8b4f...`) |
| `expectedAssetType` | String | `FD_BOND`, `CERTIFICATE`, `CRYPTO_WALLET`, `IDENTITY_DOC` |
| `onChainTokenId` | String (Optional) | If verifying an existing NFT asset in the vault |

#### Success Response Schema (`200 OK`):
```json
{
  "status": "success",
  "documentId": "doc-1726058920194",
  "documentName": "SBI_FixedDeposit_Bond.pdf",
  "documentHash": "0x3c71ea4019a82fbc789b52110c49ad0e6b18d7f2a89c09ef01a87b32c5ef2941",
  "analyzedAt": "2026-09-11T07:25:00.000Z",
  "tamperPercentage": 38,
  "riskLevel": "SUSPICIOUS",
  "summary": "38% Tampered: Inconsistent font kerning on interest rates, JPEG ELA noise disparity on maturity amounts, and secondary Adobe Photoshop header markers.",
  "scores": {
    "fontConsistencyScore": 62.0,
    "pixelElaScore": 65.0,
    "metadataIntegrityScore": 48.0,
    "blockchainAnchorVerified": false
  },
  "issues": [
    {
      "id": "iss-1",
      "category": "FONT_MISMATCH",
      "title": "Mismatched Font Kerning on 'Interest Rate: 12.50%'",
      "description": "Spectral font kerning analysis identified a Helvetica Neue insertion layer atop original Arial 7.25% vector text glyphs.",
      "severity": "HIGH",
      "zone": {
        "x": 52.0,
        "y": 34.0,
        "w": 26.0,
        "h": 12.0,
        "label": "Altered Rate"
      }
    },
    {
      "id": "iss-2",
      "category": "PIXEL_ELA",
      "title": "Error Level Analysis (ELA) Noise on Maturity Amount ₹15,00,000",
      "description": "Compression boundary frequency indicates cloned digit glyphs with inconsistent JPEG quantization matrices.",
      "severity": "HIGH",
      "zone": {
        "x": 50.0,
        "y": 52.0,
        "w": 32.0,
        "h": 14.0,
        "label": "Quantization Cloned"
      }
    }
  ],
  "visualHighlights": [
    {
      "id": "hl-1",
      "x": 48.0,
      "y": 30.0,
      "w": 32.0,
      "h": 15.0,
      "title": "Tampered Interest Rate",
      "note": "Detected synthetic glyph replacement '12.50%' overlaid on '7.25%'",
      "color": "#FFA500"
    }
  ],
  "escalationEligible": true,
  "recommendedAction": "ESCALATE_TO_VERIFICATION_OFFICER"
}
```

---

## 3. Reference Implementation: Python (FastAPI + OpenCV + Pillow)

```python
# app/forensics_engine.py
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import hashlib
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Suraksha Sathi AI Forensic Tamper Engine")

def calculate_sha256(file_bytes: bytes) -> str:
    return "0x" + hashlib.sha256(file_bytes).hexdigest()

def perform_ela(image_path: str, quality: int = 90, scale: int = 15) -> float:
    """
    Computes Error Level Analysis (ELA) variance score between 0.0 and 100.0
    """
    original = Image.open(image_path).convert('RGB')
    resaved_path = f"/tmp/resaved_ela.jpg"
    original.save(resaved_path, 'JPEG', quality=quality)
    resaved = Image.open(resaved_path)
    
    # Calculate difference
    diff = ImageChops.difference(original, resaved)
    extrema = diff.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    if max_diff == 0:
        return 0.0
    
    # Scale difference for visual inspection
    scale_factor = 255.0 / max_diff
    diff = ImageEnhance.Brightness(diff).enhance(scale_factor)
    
    diff_arr = np.array(diff)
    tamper_variance = float(np.std(diff_arr) / 2.55)
    return min(100.0, round(tamper_variance, 2))

@app.post("/api/v1/forensics/detect-tamper")
async def detect_tamper(
    file: UploadFile = File(...),
    ownerDid: str = Form(...)
):
    contents = await file.read()
    doc_hash = calculate_sha256(contents)
    
    # Save temporary file for OpenCV & ELA
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(contents)
        
    ela_score = perform_ela(temp_path)
    
    # Heuristic scoring pipeline
    tamper_percentage = int(min(98, max(0, ela_score * 0.85 + 10)))
    risk_level = "AUTHENTIC" if tamper_percentage < 10 else ("SUSPICIOUS" if tamper_percentage < 50 else "HIGH_RISK_TAMPERED")
    
    return {
        "status": "success",
        "documentName": file.filename,
        "documentHash": doc_hash,
        "tamperPercentage": tamper_percentage,
        "riskLevel": risk_level,
        "scores": {
            "pixelElaScore": round(ela_score, 2),
            "fontConsistencyScore": 68.5,
            "metadataIntegrityScore": 55.0
        }
    }
```

---

## 4. Reference Implementation: Node.js Express Middleware & Service

```typescript
// server/services/tamperService.ts
import crypto from 'crypto';

export interface TamperEvaluation {
  tamperIndex: number;
  riskLevel: 'AUTHENTIC' | 'SUSPICIOUS' | 'HIGH_RISK_TAMPERED';
  reasons: string[];
}

export function inspectDocumentTampering(buffer: Buffer, filename: string): TamperEvaluation {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const str = buffer.toString('binary');
  
  const reasons: string[] = [];
  let score = 0;
  
  // 1. Metadata check for photo editing software
  if (str.includes('Photoshop') || str.includes('GIMP') || str.includes('Canva')) {
    score += 35;
    reasons.push('Photoshop or image modification metadata trace detected');
  }
  
  // 2. Incremental PDF update anomaly check
  const trailerMatches = (str.match(/trailer/g) || []).length;
  if (trailerMatches > 2) {
    score += 25;
    reasons.push(`Multiple PDF revision trailers found (${trailerMatches} incremental overlays)`);
  }
  
  // 3. ModDate mismatch
  if (str.includes('/ModDate') && !str.includes('/CreationDate')) {
    score += 15;
    reasons.push('Document modification date exists without authoritative creation timestamp');
  }
  
  const tamperIndex = Math.min(100, Math.max(0, score));
  const riskLevel = tamperIndex === 0 ? 'AUTHENTIC' : tamperIndex < 50 ? 'SUSPICIOUS' : 'HIGH_RISK_TAMPERED';
  
  return { tamperIndex, riskLevel, reasons };
}
```
