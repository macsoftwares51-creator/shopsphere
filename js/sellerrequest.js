const API = "https://shopsphere-backend-wr5o.onrender.com";
        const form = document.getElementById("sellForm");
        const preview = document.getElementById("preview");
        const message = document.getElementById("message");
        const label = document.getElementById("fileLabel");
        const btn = document.getElementById("submitBtn");

        /* IMAGE PREVIEW */
        document.getElementById("imageInput").addEventListener("change", function(){
            const file = this.files[0];
            if(file){
                preview.src = URL.createObjectURL(file);
                preview.style.display = "block";
                label.innerText = "✅ Image selected: " + file.name;
            }
        });

        /* SUBMIT FORM */
        form.addEventListener("submit", async (e)=>{
            e.preventDefault();
            btn.innerText = "Uploading... Please wait";
            btn.disabled = true;
            
            const formData = new FormData(form);

            try {
                const res = await fetch(API + "/SellerRequest", {
                    method: "POST",
                    body: formData
                });

                if(res.ok){
                    message.className = "message success";
                    message.innerText = "Submission successful! Our admin team will review it soon.";
                    form.reset();
                    preview.style.display = "none";
                    label.innerText = "📸 Click to upload product image";
                } else {
                    throw new Error();
                }
            } catch (err) {
                message.className = "message error";
                message.innerText = "Something went wrong. Please try again.";
            } finally {
                btn.innerText = "Submit Product";
                btn.disabled = false;
            }
        });
