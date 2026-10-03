console.log("MERGE PDF JS LOADED");


const pdfFiles = document.querySelector('#pdf-files');
const mergeButton = document.querySelector('#merge-button');


pdfFiles.addEventListener("change", () => {

    console.log(pdfFiles.files);

});


mergeButton.addEventListener("click", () => {

    console.log("Merge button clicked");


    const formData = new FormData();


    for (let file of pdfFiles.files) {

        formData.append("pdfs", file);

    }


    fetch("http://127.0.0.1:8000/convert/merge/", {

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

        console.log("Merged PDF received:", blob);


        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "merged.pdf";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    })

    .catch(error => {

        console.error("Error:", error);

    });

});