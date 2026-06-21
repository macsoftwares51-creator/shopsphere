 // Get Order ID from URL (e.g., delivery.html?id=1002)
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id') || "UNKNOWN";
    document.getElementById('orderDisplay').innerText = orderId;

    const canvas = document.getElementById('signature-pad');
    const signaturePad = new SignaturePad(canvas);

    document.getElementById('clear').addEventListener('click', () => signaturePad.clear());

    document.getElementById('submit').addEventListener('click', async () => {
        const photoFile = document.getElementById('photoInput').files[0];
        if (!photoFile || signaturePad.isEmpty()) {
            return alert("Please provide both a photo and a signature.");
        }

        // Convert photo to Base64
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);
        reader.onloadend = async () => {
            const payload = {
                orderId: orderId,
                productImg: reader.result,
                signatureImg: signaturePad.toDataURL()
            };

           const response = await fetch('https://shopsphere-backend.onrender.com/api/proof/submit-proof', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
});

            if (response.ok) alert("Proof submitted! Naming format applied.");
        };
    });
