console.log("SPLIT PDF JS LOADED");


const pdfFile = document.querySelector('#pdf-file');
const startPage = document.querySelector('#start-page');
const endPage = document.querySelector('#end-page');
const splitButton = document.querySelector('#split-button');


pdfFile.addEventListener("change", () => {

    console.log(pdfFile.files[0]);

});


splitButton.addEventListener("click", () => {

    console.log("Split button clicked");


    const formData = new FormData();

    formData.append("pdf", pdfFile.files[0]);
    formData.append("start_page", startPage.value);
    formData.append("end_page", endPage.value);


    fetch("http://127.0.0.1:8000/convert/split/", {

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

        console.log("PDF received:", blob);


        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = "split.pdf";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    })

    .catch(error => {

        console.error("Error:", error);

    });

});