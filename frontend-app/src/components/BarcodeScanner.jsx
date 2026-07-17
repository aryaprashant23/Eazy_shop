import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';

export default function BarcodeScanner({ onScan }) {
    const scannerRef = useRef(null);
    const [scannerActive, setScannerActive] = useState(false);
    
    // We keep track of the last scanned code to prevent rapid repeated scans
    const lastScannedRef = useRef('');

    useEffect(() => {
        let scanner = null;

        if (scannerActive) {
            scanner = new Html5QrcodeScanner(
                "barcode-reader",
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    formatsToSupport: [ 
                        0, // QR_CODE
                        1, // AZTEC
                        2, // CODABAR
                        3, // CODE_39
                        4, // CODE_93
                        5, // CODE_128
                        6, // DATA_MATRIX
                        7, // MAXICODE
                        8, // ITF
                        9, // EAN_13
                        10, // EAN_8
                        11, // PDF_417
                        12, // RSS_14
                        13, // RSS_EXPANDED
                        14, // UPC_A
                        15, // UPC_E
                        16, // UPC_EAN_EXTENSION
                    ]
                },
                false // non-verbose
            );

            scanner.render(
                (decodedText) => {
                    // Prevent same barcode from firing 10 times a second
                    if (decodedText !== lastScannedRef.current) {
                        lastScannedRef.current = decodedText;
                        onScan(decodedText);
                        
                        // Reset the debounce after 3 seconds so they can scan the same item again if needed
                        setTimeout(() => {
                            lastScannedRef.current = '';
                        }, 3000);
                    }
                },
                (errorMessage) => {
                    // Ignore standard scan failure messages (it fires every frame it doesn't see a barcode)
                }
            );
            
            scannerRef.current = scanner;
        }

        // Cleanup function when component unmounts or scanner gets disabled
        return () => {
            if (scanner) {
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [scannerActive, onScan]);

    return (
        <div style={{ marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
            
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={18} className="text-primary" /> Camera Scanner
                </div>
                <button 
                    className={`btn ${scannerActive ? 'btn-danger' : 'btn-primary'}`} 
                    onClick={() => setScannerActive(!scannerActive)}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {scannerActive ? (
                        <><CameraOff size={16} /> Stop Camera</>
                    ) : (
                        <><Camera size={16} /> Start Camera</>
                    )}
                </button>
            </div>

            {scannerActive ? (
                <div id="barcode-reader" style={{ width: '100%', minHeight: '300px' }}></div>
            ) : (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Camera size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                    <p>Click "Start Camera" to scan a product barcode.</p>
                </div>
            )}
            
            {/* Custom CSS overrides for html5-qrcode standard ugly styles */}
            <style dangerouslySetInnerHTML={{__html: `
                #barcode-reader { border: none !important; }
                #barcode-reader button {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    margin: 0.5rem;
                    cursor: pointer;
                }
                #barcode-reader a { color: var(--primary); }
            `}} />
        </div>
    );
}
