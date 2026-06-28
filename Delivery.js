document.addEventListener("DOMContentLoaded", () => {
    // 1. Unpack context parameters cleanly
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id') || "UNKNOWN";
    document.getElementById('orderDisplay').innerText = orderId;

    const canvas = document.getElementById('signature-pad');
    
    // Core Fix: Force drawing buffers to match the physical client bounding boxes
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear(); // Clear memory buffering boundaries safely
    }

    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });

    // Run layout normalization
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    document.getElementById('clear').addEventListener('click', () => signaturePad.clear());

    document.getElementById('submit').addEventListener('click', async () => {
        const photoFile = document.getElementById('photoInput').files[0];
        
        if (!photoFile) {
            return alert("Please take or upload a product delivery photo.");
        }
        if (signaturePad.isEmpty()) {
            return alert("Please have the customer provide their signature confirmation.");
        }

        const submitBtn = document.getElementById('submit');
        submitBtn.disabled = true;
        submitBtn.innerText = "UPLOADING PROOF STREAM...";

        // Process file via native filereader boundaries 
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);
        reader.onloadend = async () => {
            const payload = {
                orderId: orderId,
                productImg: reader.result, // Sent as standard base64 string
                signatureImg: signaturePad.toDataURL() // Sent as clear tracking base-64 canvas map
            };

            try {
                const response = await fetch('https://shopsphere-backend.onrender.com/api/proof/submit-proof', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                
                if (response.ok) {
                    alert(`✅ Proof Processed successfully!\nSaved details as: ${result.message}`);
                    window.location.reload(); // Fresh layout dump
                } else {
                    alert(`❌ Upload Error: ${result.error || 'Server error'}`);
                }
            } catch (err) {
                console.error(err);
                alert("❌ Connection to Render server timed out.");
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "UPLOAD SYSTEM PROOF";
            }
        };
    });
});
