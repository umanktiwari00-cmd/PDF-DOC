console.log("PDF PPT JS LOADED");


const pdfFile = document.querySelector('#pdf-file');
const convertButton = document.querySelector('#convert-button');


pdfFile.addEventListener("change", () => {

    console.log(pdfFile.files[0]);

});


convertButton.addEventListener("click", () => {

    console.log("Convert button clicked");


    const formData = new FormData();

    formData.append("pdf", pdfFile.files[0]);


    fetch("http://127.0.0.1:8000/convert/ppt/", {

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

        console.log("PowerPoint received:", blob);


        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "converted.pptx";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    })

    .catch(error => {

        console.error("Error:", error);

    });

});