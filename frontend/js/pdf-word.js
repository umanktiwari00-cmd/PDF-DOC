const pdfFile = document.querySelector('#pdf-file');
const convertButton = document.querySelector('#convert-button');


// When PDF is selected
pdfFile.addEventListener("change", () => {
    console.log(pdfFile.files[0]);
});


// When Convert button is clicked
convertButton.addEventListener("click", () => {

    console.log("Convert button clicked");

    const formData = new FormData();

    formData.append("pdf", pdfFile.files[0]);

    const file = pdfFile.files[0].name;
    const wordFile = file.replace(".pdf", ".docx");

    fetch("http://127.0.0.1:8000/convert/word/", {
        method: "POST",
        body: formData
    })

    .then(response => {

        console.log("Response:", response);
        console.log("Status:", response.status);
        console.log("OK:", response.ok);

        return response.blob();
    })

    .then(blob => {

        console.log("Blob received:", blob);

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = wordFile;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    })

    .catch(error => {
        console.error("Error:", error);
    });
});


