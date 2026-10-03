console.log("PDFDOC SCRIPT LOADED");


/* =====================================================
   ELEMENTS
===================================================== */

const fromButton =
    document.querySelector("#from-button");

const toButton =
    document.querySelector("#to-button");


const fromDropdown =
    document.querySelector("#from-dropdown");

const toDropdown =
    document.querySelector("#to-dropdown");


const fromSearch =
    document.querySelector("#from-search");

const toSearch =
    document.querySelector("#to-search");


const fromSelected =
    document.querySelector("#from-selected");

const toSelected =
    document.querySelector("#to-selected");


const fromNoResults =
    document.querySelector("#from-no-results");

const toNoResults =
    document.querySelector("#to-no-results");


const swapButton =
    document.querySelector("#swap-button");


const conversionMessage =
    document.querySelector("#conversion-message");


const conversionButton =
    document.querySelector("#conversion-button");


const uploadButton =
    document.querySelector("#upload-button");


const converterFile =
    document.querySelector("#converter-file");


const selectedFile =
    document.querySelector("#selected-file");


const uploadTitle =
    document.querySelector("#upload-title");


const uploadDescription =
    document.querySelector("#upload-description");


/* =====================================================
   FORMAT INFORMATION
===================================================== */

const formatData = {

    PDF: {
        extensions: [".pdf"],
        accept: ".pdf"
    },

    Word: {
        extensions: [".doc", ".docx"],
        accept: ".doc,.docx"
    },

    Excel: {
        extensions: [".xls", ".xlsx"],
        accept: ".xls,.xlsx"
    },

    PowerPoint: {
        extensions: [".ppt", ".pptx"],
        accept: ".ppt,.pptx"
    },

    JPG: {
        extensions: [".jpg", ".jpeg"],
        accept: ".jpg,.jpeg"
    },

    PNG: {
        extensions: [".png"],
        accept: ".png"
    },

    Text: {
        extensions: [".txt"],
        accept: ".txt"
    }

};


/* =====================================================
   AVAILABLE CONVERSIONS
===================================================== */

const availableConversions = {

    "PDF-Text": true,

    "PDF-Word": true,

    "PDF-Excel": true,

    "PDF-PowerPoint": true,

    "PDF-JPG": true,

    "PDF-PNG": true,


    "Word-PDF": false,

    "Excel-PDF": false,

    "PowerPoint-PDF": false,

    "JPG-PDF": false,

    "PNG-PDF": false,

    "Text-PDF": false

};


/* =====================================================
   DJANGO HOMEPAGE ENDPOINT
===================================================== */

const conversionEndpoint =
    "http://127.0.0.1:8000/convert/";


/* =====================================================
   UPDATE FILE PICKER
===================================================== */

function updateFilePicker() {

    const fromFormat =
        fromSelected.textContent.trim();


    const data =
        formatData[fromFormat];


    if (!data) {

        converterFile.accept = "";

        return;

    }


    /* Set accepted file types */

    converterFile.accept =
        data.accept;


    /*
        Clear the previously selected file
        when the FROM format changes.
    */

    converterFile.value = "";


    selectedFile.textContent =
        "No file selected";


    /* Update upload text */

    uploadTitle.textContent =
        `Upload your ${fromFormat}`;


    uploadDescription.textContent =
        `Select a ${fromFormat} file to convert.`;

}


/* =====================================================
   UPDATE CONVERSION UI
===================================================== */

function updateConversion() {

    const from =
        fromSelected.textContent.trim();


    const to =
        toSelected.textContent.trim();


    const conversionKey =
        `${from}-${to}`;


    /* =========================
       BUTTON TEXT
    ========================= */

    conversionButton.textContent =
        `Convert ${from} to ${to}`;


    /* =========================
       AVAILABILITY
    ========================= */

    if (
        availableConversions[conversionKey]
    ) {

        conversionMessage.textContent =
            `${from} → ${to} is available.`;

        conversionButton.disabled =
            false;

    }

    else {

        conversionMessage.textContent =
            `${from} → ${to} is not available yet. We're working on adding it.`;

        conversionButton.disabled =
            true;

    }


    /* =========================
       UPDATE FILE PICKER
    ========================= */

    updateFilePicker();

}


/* =====================================================
   OPEN FROM DROPDOWN
===================================================== */

fromButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        fromDropdown.classList.toggle(
            "active"
        );


        toDropdown.classList.remove(
            "active"
        );


        if (
            fromDropdown.classList.contains(
                "active"
            )
        ) {

            fromSearch.focus();

        }

    }
);


/* =====================================================
   OPEN TO DROPDOWN
===================================================== */

toButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();


        toDropdown.classList.toggle(
            "active"
        );


        fromDropdown.classList.remove(
            "active"
        );


        if (
            toDropdown.classList.contains(
                "active"
            )
        ) {

            toSearch.focus();

        }

    }
);


/* =====================================================
   FILTER OPTIONS
===================================================== */

function filterOptions(
    searchInput,
    dropdown,
    noResults
) {

    const searchText =
        searchInput.value
            .toLowerCase()
            .trim();


    const options =
        dropdown.querySelectorAll(
            ".format-option"
        );


    let found = false;


    options.forEach(
        (option) => {

            const formatName =
                option.textContent
                    .toLowerCase();


            if (
                formatName.includes(
                    searchText
                )
            ) {

                option.style.display =
                    "block";


                found = true;

            }

            else {

                option.style.display =
                    "none";


                option.classList.remove(
                    "keyboard-selected"
                );

            }

        }
    );


    /* Show/hide no-results message */

    noResults.hidden =
        found;


    /* Reset keyboard selection */

    options.forEach(
        (option) => {

            option.classList.remove(
                "keyboard-selected"
            );

        }
    );

}


/* =====================================================
   FROM SEARCH
===================================================== */

fromSearch.addEventListener(
    "input",
    () => {

        filterOptions(
            fromSearch,
            fromDropdown,
            fromNoResults
        );

    }
);


/* =====================================================
   TO SEARCH
===================================================== */

toSearch.addEventListener(
    "input",
    () => {

        filterOptions(
            toSearch,
            toDropdown,
            toNoResults
        );

    }
);


/* =====================================================
   SELECT FORMAT
===================================================== */

function selectFormat(
    option,
    selectedElement,
    dropdown,
    searchInput,
    options,
    noResults
) {

    selectedElement.textContent =
        option.textContent.trim();


    dropdown.classList.remove(
        "active"
    );


    searchInput.value =
        "";


    options.forEach(
        (item) => {

            item.style.display =
                "block";


            item.classList.remove(
                "keyboard-selected"
            );

        }
    );


    noResults.hidden =
        true;


    updateConversion();

}


/* =====================================================
   FROM OPTIONS
===================================================== */

const fromOptions =
    fromDropdown.querySelectorAll(
        ".format-option"
    );


fromOptions.forEach(
    (option) => {

        option.addEventListener(
            "click",
            () => {

                selectFormat(
                    option,
                    fromSelected,
                    fromDropdown,
                    fromSearch,
                    fromOptions,
                    fromNoResults
                );

            }
        );

    }
);


/* =====================================================
   TO OPTIONS
===================================================== */

const toOptions =
    toDropdown.querySelectorAll(
        ".format-option"
    );


toOptions.forEach(
    (option) => {

        option.addEventListener(
            "click",
            () => {

                selectFormat(
                    option,
                    toSelected,
                    toDropdown,
                    toSearch,
                    toOptions,
                    toNoResults
                );

            }
        );

    }
);


/* =====================================================
   KEYBOARD NAVIGATION
===================================================== */

function setupKeyboardNavigation(
    searchInput,
    dropdown
) {

    searchInput.addEventListener(
        "keydown",
        (event) => {

            const visibleOptions =
                Array.from(
                    dropdown.querySelectorAll(
                        ".format-option"
                    )
                ).filter(
                    (option) => {

                        return (
                            option.style.display !==
                            "none"
                        );

                    }
                );


            if (
                visibleOptions.length === 0
            ) {

                return;

            }


            let currentIndex =
                visibleOptions.findIndex(
                    (option) => {

                        return option.classList.contains(
                            "keyboard-selected"
                        );

                    }
                );


            /* =========================
               ARROW DOWN
            ========================= */

            if (
                event.key ===
                "ArrowDown"
            ) {

                event.preventDefault();


                if (
                    currentIndex === -1
                ) {

                    currentIndex =
                        0;

                }

                else {

                    currentIndex++;


                    if (
                        currentIndex >=
                        visibleOptions.length
                    ) {

                        currentIndex =
                            0;

                    }

                }


                highlightOption(
                    visibleOptions,
                    currentIndex
                );

            }


            /* =========================
               ARROW UP
            ========================= */

            if (
                event.key ===
                "ArrowUp"
            ) {

                event.preventDefault();


                if (
                    currentIndex === -1
                ) {

                    currentIndex =
                        visibleOptions.length - 1;

                }

                else {

                    currentIndex--;


                    if (
                        currentIndex < 0
                    ) {

                        currentIndex =
                            visibleOptions.length - 1;

                    }

                }


                highlightOption(
                    visibleOptions,
                    currentIndex
                );

            }


            /* =========================
               ENTER
            ========================= */

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                if (
                    currentIndex !== -1
                ) {

                    visibleOptions[
                        currentIndex
                    ].click();

                }

                else if (
                    visibleOptions.length === 1
                ) {

                    visibleOptions[
                        0
                    ].click();

                }

            }

        }
    );

}


/* =====================================================
   HIGHLIGHT KEYBOARD OPTION
===================================================== */

function highlightOption(
    options,
    index
) {

    options.forEach(
        (option) => {

            option.classList.remove(
                "keyboard-selected"
            );

        }
    );


    const selectedOption =
        options[index];


    selectedOption.classList.add(
        "keyboard-selected"
    );


    selectedOption.scrollIntoView(
        {
            block: "nearest"
        }
    );

}


/* =====================================================
   ENABLE KEYBOARD NAVIGATION
===================================================== */

setupKeyboardNavigation(
    fromSearch,
    fromDropdown
);


setupKeyboardNavigation(
    toSearch,
    toDropdown
);


/* =====================================================
   SWAP FORMATS
===================================================== */

swapButton.addEventListener(
    "click",
    () => {

        const fromValue =
            fromSelected.textContent.trim();


        const toValue =
            toSelected.textContent.trim();


        fromSelected.textContent =
            toValue;


        toSelected.textContent =
            fromValue;


        updateConversion();

    }
);


/* =====================================================
   OPEN FILE PICKER
===================================================== */

uploadButton.addEventListener(
    "click",
    () => {

        converterFile.click();

    }
);


/* =====================================================
   VALIDATE FILE
===================================================== */

function validateFile(
    file
) {

    const fromFormat =
        fromSelected.textContent.trim();


    const data =
        formatData[fromFormat];


    if (!data) {

        return false;

    }


    const fileName =
        file.name.toLowerCase();


    return data.extensions.some(
        (extension) => {

            return fileName.endsWith(
                extension
            );

        }
    );

}


/* =====================================================
   FILE SELECTED
===================================================== */

converterFile.addEventListener(
    "change",
    () => {

        if (
            converterFile.files.length === 0
        ) {

            selectedFile.textContent =
                "No file selected";

            return;

        }


        const file =
            converterFile.files[0];


        /* =========================
           VALIDATE
        ========================= */

        if (
            !validateFile(file)
        ) {

            const fromFormat =
                fromSelected.textContent.trim();


            selectedFile.textContent =
                `❌ Please select a ${fromFormat} file.`;


            converterFile.value =
                "";


            return;

        }


        /* =========================
           VALID FILE
        ========================= */

        selectedFile.textContent =
            `Selected: ${file.name}`;

    }
);


/* =====================================================
   CONVERT FILE
===================================================== */

conversionButton.addEventListener(
    "click",
    async () => {

        /* =========================
           GET FILE
        ========================= */

        const file =
            converterFile.files[0];


        if (!file) {

            selectedFile.textContent =
                "Please choose a file first.";

            return;

        }


        /* =========================
           VALIDATE FILE
        ========================= */

        if (
            !validateFile(file)
        ) {

            selectedFile.textContent =
                "❌ Invalid file type.";

            return;

        }


        /* =========================
           GET FORMATS
        ========================= */

        const from =
            fromSelected.textContent.trim();


        const to =
            toSelected.textContent.trim();


        const conversionKey =
            `${from}-${to}`;


        console.log(
            "From:",
            from
        );


        console.log(
            "To:",
            to
        );


        console.log(
            "File:",
            file.name
        );


        /* =========================
           CHECK AVAILABILITY
        ========================= */

        if (
            !availableConversions[
                conversionKey
            ]
        ) {

            conversionMessage.textContent =
                `${from} → ${to} is not available yet.`;

            return;

        }


        /* =========================
           CREATE FORMDATA
        ========================= */

        const formData =
            new FormData();


        formData.append(
            "pdf",
            file
        );


        formData.append(
            "from_format",
            from
        );


        formData.append(
            "to_format",
            to
        );


        console.log(
            "Sending file to Django..."
        );


        /* =========================
           DISABLE BUTTON
        ========================= */

        conversionButton.disabled =
            true;


        conversionButton.textContent =
            "Converting...";


        conversionMessage.textContent =
            "Your file is being converted...";


        try {

            /* =========================
               FETCH + POST
            ========================= */

            const response =
                await fetch(
                    conversionEndpoint,
                    {
                        method: "POST",

                        body: formData
                    }
                );


            console.log(
                "Django response:",
                response
            );


            console.log(
                "Status:",
                response.status
            );


            /* =========================
               CHECK RESPONSE
            ========================= */

            if (
                !response.ok
            ) {

                const errorText =
                    await response.text();


                console.error(
                    "Django error:",
                    errorText
                );


                throw new Error(
                    errorText ||
                    "Conversion failed."
                );

            }


            /* =========================
               GET RESPONSE BLOB
            ========================= */

            const blob =
                await response.blob();


            console.log(
                "Converted file received:",
                blob
            );


            /* =========================
               CREATE DOWNLOAD URL
            ========================= */

            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            /* =========================
               DOWNLOAD FILE NAME
            ========================= */

            let fileName =
                "converted";


            if (
                from === "PDF"
            ) {

                if (
                    to === "Text"
                ) {

                    fileName =
                        file.name.replace(
                            /\.pdf$/i,
                            ".txt"
                        );

                }

                else if (
                    to === "Word"
                ) {

                    fileName =
                        file.name.replace(
                            /\.pdf$/i,
                            ".docx"
                        );

                }

                else if (
                    to === "Excel"
                ) {

                    fileName =
                        file.name.replace(
                            /\.pdf$/i,
                            ".xlsx"
                        );

                }

                else if (
                    to === "PowerPoint"
                ) {

                    fileName =
                        file.name.replace(
                            /\.pdf$/i,
                            ".pptx"
                        );

                }

                else if (
                    to === "JPG" ||
                    to === "PNG"
                ) {

                    /*
                        Current Django image
                        converter returns a ZIP.
                    */

                    fileName =
                        file.name.replace(
                            /\.pdf$/i,
                            "-images.zip"
                        );

                }

            }


            link.download =
                fileName;


            /* =========================
               START DOWNLOAD
            ========================= */

            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            URL.revokeObjectURL(
                url
            );


            /* =========================
               SUCCESS
            ========================= */

            conversionMessage.textContent =
                "Conversion completed successfully.";

        }

        catch (
            error
        ) {

            console.error(
                "Conversion error:",
                error
            );


            conversionMessage.textContent =
                "Something went wrong during conversion.";

        }


        /* =========================
           RESTORE BUTTON
        ========================= */

        conversionButton.disabled =
            false;


        updateConversion();

    }
);


/* =====================================================
   CLOSE DROPDOWNS
===================================================== */

document.addEventListener(
    "click",
    (event) => {

        if (
            !fromButton.contains(
                event.target
            ) &&
            !fromDropdown.contains(
                event.target
            )
        ) {

            fromDropdown.classList.remove(
                "active"
            );

        }


        if (
            !toButton.contains(
                event.target
            ) &&
            !toDropdown.contains(
                event.target
            )
        ) {

            toDropdown.classList.remove(
                "active"
            );

        }

    }
);


/* =====================================================
   INITIAL SETUP
===================================================== */

updateConversion();