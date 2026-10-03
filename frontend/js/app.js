"use strict";


// ============================================================
// PDFDOC CONFIGURATION
// ============================================================

const PDFDOC_CONFIG = {

    API_URL: "http://127.0.0.1:8000/convert/",

    MAX_FILE_SIZE: 50 * 1024 * 1024,

    availableConversions: {

        "PDF-Text": true,
        "PDF-Word": true,
        "PDF-Excel": true,
        "PDF-PowerPoint": true,
        "PDF-JPG": true,

        "PDF-PNG": false,

        "Word-PDF": false,
        "Excel-PDF": false,
        "PowerPoint-PDF": false,

        "JPG-PDF": true,

        "PNG-PDF": false,
        "Text-PDF": false
    }

};


// ============================================================
// FORMAT INFORMATION
// ============================================================

const FORMAT_DATA = {

    PDF: {
        label: "PDF",
        extensions: [".pdf"],
        accept: ".pdf",
        mimeTypes: [
            "application/pdf"
        ]
    },

    Word: {
        label: "Word",
        extensions: [".doc", ".docx"],
        accept: ".doc,.docx",
        mimeTypes: [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
    },

    Excel: {
        label: "Excel",
        extensions: [".xls", ".xlsx"],
        accept: ".xls,.xlsx",
        mimeTypes: [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ]
    },

    PowerPoint: {
        label: "PowerPoint",
        extensions: [".ppt", ".pptx"],
        accept: ".ppt,.pptx",
        mimeTypes: [
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ]
    },

    JPG: {
        label: "JPG",
        extensions: [
            ".jpg",
            ".jpeg"
        ],
        accept: ".jpg,.jpeg",
        mimeTypes: [
            "image/jpeg"
        ]
    },

    PNG: {
        label: "PNG",
        extensions: [".png"],
        accept: ".png",
        mimeTypes: [
            "image/png"
        ]
    },

    Text: {
        label: "Text",
        extensions: [".txt"],
        accept: ".txt",
        mimeTypes: [
            "text/plain"
        ]
    }

};


// ============================================================
// TOOL PAGE CONFIGURATION
// ============================================================

const TOOL_PAGES = {

    "pdf-text.html": {
        from: "PDF",
        to: "Text"
    },

    "pdf-word.html": {
        from: "PDF",
        to: "Word"
    },

    "pdf-excel.html": {
        from: "PDF",
        to: "Excel"
    },

    "pdf-ppt.html": {
        from: "PDF",
        to: "PowerPoint"
    },

    "pdf-image.html": {
        from: "PDF",
        to: "JPG"
    }

};


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getCurrentPage() {

    const path = window.location.pathname;

    const page = path.split("/").pop();

    return page || "index.html";
}


function getFormatInfo(format) {

    return FORMAT_DATA[format] || null;
}


function isConversionAvailable(fromFormat, toFormat) {

    const key = `${fromFormat}-${toFormat}`;

    return PDFDOC_CONFIG.availableConversions[key] === true;
}


function getFileExtension(fileName) {

    const lastDot = fileName.lastIndexOf(".");

    if (lastDot === -1) {
        return "";
    }

    return fileName
        .slice(lastDot)
        .toLowerCase();
}


function validateFileSize(file) {

    if (file.size > PDFDOC_CONFIG.MAX_FILE_SIZE) {

        const maxMB =
            PDFDOC_CONFIG.MAX_FILE_SIZE / (1024 * 1024);

        throw new Error(
            `File is too large. Maximum allowed size is ${maxMB} MB.`
        );
    }

    return true;
}


function validateFile(file, expectedFormat) {

    if (!file) {

        throw new Error(
            `Please select a ${expectedFormat} file.`
        );
    }

    validateFileSize(file);

    const formatInfo =
        getFormatInfo(expectedFormat);

    if (!formatInfo) {
        return true;
    }

    const extension =
        getFileExtension(file.name);

    if (!formatInfo.extensions.includes(extension)) {

        throw new Error(
            `Please select a valid ${formatInfo.label} file.`
        );
    }

    return true;
}


function createDownloadFileName(
    originalFileName,
    toFormat
) {

    const extensionMap = {

        PDF: ".pdf",
        Word: ".docx",
        Excel: ".xlsx",
        PowerPoint: ".pptx",
        JPG: ".jpg",
        PNG: ".png",
        Text: ".txt"

    };

    const extension =
        extensionMap[toFormat] || "";

    const originalName =
        originalFileName.replace(/\.[^/.]+$/, "");

    return originalName + extension;
}


function getFilenameFromResponse(response) {

    const disposition =
        response.headers.get("Content-Disposition");

    if (!disposition) {
        return null;
    }

    const utf8Match =
        disposition.match(
            /filename\*=UTF-8''([^;]+)/i
        );

    if (utf8Match) {

        try {

            return decodeURIComponent(
                utf8Match[1]
            );

        } catch (error) {

            return utf8Match[1];
        }
    }

    const normalMatch =
        disposition.match(
            /filename="?([^"]+)"?/i
        );

    if (normalMatch) {
        return normalMatch[1];
    }

    return null;
}


function downloadBlob(blob, fileName) {

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download = fileName;

    link.style.display = "none";

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(
        function () {

            URL.revokeObjectURL(url);

        },
        1000
    );
}


// ============================================================
// SERVER ERROR HANDLING
// ============================================================

async function getServerErrorMessage(response) {

    try {

        const contentType =
            response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {

            const data =
                await response.json();

            if (data.error) {
                return data.error;
            }

            if (data.message) {
                return data.message;
            }
        }

        const text =
            await response.text();

        if (text.trim()) {
            return text.trim();
        }

    } catch (error) {

        console.error(
            "Could not read server error:",
            error
        );
    }

    return `Server returned an error (${response.status}).`;
}


// ============================================================
// UNIVERSAL CONVERSION REQUEST
// ============================================================

async function convertFile(
    file,
    fromFormat,
    toFormat
) {

    if (
        !isConversionAvailable(
            fromFormat,
            toFormat
        )
    ) {

        throw new Error(
            `${fromFormat} → ${toFormat} is not available yet.`
        );
    }

    validateFile(
        file,
        fromFormat
    );

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "from_format",
        fromFormat
    );

    formData.append(
        "to_format",
        toFormat
    );

    let response;

    try {

        response =
            await fetch(
                PDFDOC_CONFIG.API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );

    } catch (error) {

        console.error(
            "Network error:",
            error
        );

        throw new Error(
            "Unable to connect to the PDFDOC server. Make sure Django is running."
        );
    }

    if (!response.ok) {

        const errorMessage =
            await getServerErrorMessage(response);

        throw new Error(
            errorMessage
        );
    }

    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {

        const data =
            await response.json();

        throw new Error(
            data.error ||
            data.message ||
            "Server did not return a converted file."
        );
    }

    const blob =
        await response.blob();

    if (!blob.size) {

        throw new Error(
            "The server returned an empty file."
        );
    }

    return {

        blob: blob,

        fileName:
            getFilenameFromResponse(response)

    };
}


// ============================================================
// HOMEPAGE
// ============================================================

function initializeHomepage() {

    const fromButton =
        document.getElementById("from-button");

    const toButton =
        document.getElementById("to-button");

    const fromSelected =
        document.getElementById("from-selected");

    const toSelected =
        document.getElementById("to-selected");

    const fromDropdown =
        document.getElementById("from-dropdown");

    const toDropdown =
        document.getElementById("to-dropdown");

    const fromSearch =
        document.getElementById("from-search");

    const toSearch =
        document.getElementById("to-search");

    const swapButton =
        document.getElementById("swap-button");

    const conversionMessage =
        document.getElementById("conversion-message");

    const uploadArea =
        document.getElementById("upload-area");

    const uploadTitle =
        document.getElementById("upload-title");

    const uploadDescription =
        document.getElementById("upload-description");

    const converterFile =
        document.getElementById("converter-file");

    const uploadButton =
        document.getElementById("upload-button");

    const selectedFile =
        document.getElementById("selected-file");

    const conversionButton =
        document.getElementById("conversion-button");


    if (
        !fromButton ||
        !toButton ||
        !fromDropdown ||
        !toDropdown ||
        !converterFile ||
        !conversionButton
    ) {

        return;
    }


    // ----------------------------------------------------------
    // State
    // ----------------------------------------------------------

    let fromFormat = "PDF";

    let toFormat = "JPG";

    let isConverting = false;


    // ==========================================================
    // DROPDOWN CONTROL
    // ==========================================================

    function setDropdownState(dropdown, button, open) {

        if (!dropdown || !button) {
            return;
        }

        if (open) {

            dropdown.classList.add("show");

            dropdown.hidden = false;

            dropdown.style.display = "block";
            dropdown.style.visibility = "visible";
            dropdown.style.opacity = "1";
            dropdown.style.pointerEvents = "auto";
            dropdown.style.zIndex = "1000";

            button.setAttribute(
                "aria-expanded",
                "true"
            );

        } else {

            dropdown.classList.remove("show");

            dropdown.hidden = true;

            dropdown.style.display = "none";
            dropdown.style.visibility = "hidden";
            dropdown.style.opacity = "0";
            dropdown.style.pointerEvents = "none";

            button.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    }


    function closeDropdowns() {

        setDropdownState(
            fromDropdown,
            fromButton,
            false
        );

        setDropdownState(
            toDropdown,
            toButton,
            false
        );
    }


    function openFromDropdown() {

        setDropdownState(
            toDropdown,
            toButton,
            false
        );

        const isOpen =
            fromDropdown.classList.contains("show");

        setDropdownState(
            fromDropdown,
            fromButton,
            !isOpen
        );
    }


    function openToDropdown() {

        setDropdownState(
            fromDropdown,
            fromButton,
            false
        );

        const isOpen =
            toDropdown.classList.contains("show");

        setDropdownState(
            toDropdown,
            toButton,
            !isOpen
        );
    }


    // ==========================================================
    // UPDATE UI
    // ==========================================================

    function updateConversionUI() {

        const available =
            isConversionAvailable(
                fromFormat,
                toFormat
            );


        fromSelected.textContent =
            fromFormat;

        toSelected.textContent =
            toFormat;


        const formatInfo =
            getFormatInfo(fromFormat);


        if (formatInfo) {

            converterFile.accept =
                formatInfo.accept;

            if (uploadTitle) {

                uploadTitle.textContent =
                    `Upload your ${formatInfo.label}`;
            }

            if (uploadDescription) {

                uploadDescription.textContent =
                    `Select a ${formatInfo.label} file to convert.`;
            }
        }


        if (conversionMessage) {

            if (available) {

                conversionMessage.textContent =
                    `${fromFormat} → ${toFormat} is available.`;

            } else {

                conversionMessage.textContent =
                    `${fromFormat} → ${toFormat} is not available yet. We're working on adding it in the future.`;
            }
        }


        conversionButton.textContent =
            `Convert ${fromFormat} to ${toFormat}`;


        conversionButton.disabled =
            !available ||
            isConverting;


        converterFile.value = "";


        if (selectedFile) {

            selectedFile.textContent =
                "No file selected";
        }
    }


    // ==========================================================
    // DROPDOWN BUTTON EVENTS
    // ==========================================================

    fromButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openFromDropdown();
        }
    );


    toButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openToDropdown();
        }
    );


    // ==========================================================
    // FORMAT OPTIONS
    // ==========================================================

    const formatOptions =
        document.querySelectorAll(".format-option");


    formatOptions.forEach(
        function (option) {

            option.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    const format =
                        option.dataset.format;

                    const dropdown =
                        option.closest(".format-dropdown");


                    if (
                        dropdown === fromDropdown
                    ) {

                        fromFormat =
                            format;

                    } else if (
                        dropdown === toDropdown
                    ) {

                        toFormat =
                            format;
                    }


                    closeDropdowns();


                    if (fromSearch) {
                        fromSearch.value = "";
                    }

                    if (toSearch) {
                        toSearch.value = "";
                    }


                    resetFormatSearch(
                        fromDropdown
                    );

                    resetFormatSearch(
                        toDropdown
                    );


                    updateConversionUI();

                }
            );

        }
    );


    // ==========================================================
    // FORMAT SEARCH
    // ==========================================================

    function filterFormats(
        input,
        dropdown
    ) {

        const searchValue =
            input.value
                .trim()
                .toLowerCase();


        const options =
            dropdown.querySelectorAll(
                ".format-option"
            );


        const noResults =
            dropdown.querySelector(
                ".no-format-message"
            );


        let visibleCount = 0;


        options.forEach(
            function (option) {

                const format =
                    (
                        option.dataset.format ||
                        ""
                    ).toLowerCase();


                const matches =
                    format.includes(
                        searchValue
                    );


                option.style.display =
                    matches
                        ? ""
                        : "none";


                if (matches) {
                    visibleCount++;
                }

            }
        );


        if (noResults) {

            noResults.hidden =
                visibleCount !== 0;
        }
    }


    function resetFormatSearch(dropdown) {

        const options =
            dropdown.querySelectorAll(
                ".format-option"
            );


        options.forEach(
            function (option) {

                option.style.display =
                    "";

            }
        );


        const noResults =
            dropdown.querySelector(
                ".no-format-message"
            );


        if (noResults) {

            noResults.hidden = true;
        }
    }


    if (fromSearch) {

        fromSearch.addEventListener(
            "input",
            function () {

                filterFormats(
                    fromSearch,
                    fromDropdown
                );

            }
        );

        fromSearch.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );
    }


    if (toSearch) {

        toSearch.addEventListener(
            "input",
            function () {

                filterFormats(
                    toSearch,
                    toDropdown
                );

            }
        );

        toSearch.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );
    }


    // ==========================================================
    // SWAP
    // ==========================================================

    if (swapButton) {

        swapButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                const oldFrom =
                    fromFormat;

                fromFormat =
                    toFormat;

                toFormat =
                    oldFrom;

                closeDropdowns();

                updateConversionUI();

            }
        );
    }


    // ==========================================================
    // CHOOSE FILE
    // ==========================================================

    if (uploadButton) {

        uploadButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                if (isConverting) {
                    return;
                }

                converterFile.click();

            }
        );
    }


    // ==========================================================
    // FILE SELECTED
    // ==========================================================

    converterFile.addEventListener(
        "change",
        function () {

            const file =
                converterFile.files[0];


            if (!file) {

                if (selectedFile) {

                    selectedFile.textContent =
                        "No file selected";
                }

                return;
            }


            try {

                validateFile(
                    file,
                    fromFormat
                );


                if (selectedFile) {

                    selectedFile.textContent =
                        `Selected: ${file.name}`;
                }

            } catch (error) {

                converterFile.value = "";

                if (selectedFile) {

                    selectedFile.textContent =
                        "No file selected";
                }

                alert(
                    error.message
                );
            }

        }
    );


    // ==========================================================
    // DRAG AND DROP
    // ==========================================================

    if (uploadArea) {

        uploadArea.addEventListener(
            "dragover",
            function (event) {

                event.preventDefault();

                if (isConverting) {
                    return;
                }

                uploadArea.classList.add(
                    "drag-over"
                );

            }
        );


        uploadArea.addEventListener(
            "dragleave",
            function () {

                uploadArea.classList.remove(
                    "drag-over"
                );

            }
        );


        uploadArea.addEventListener(
            "drop",
            function (event) {

                event.preventDefault();

                uploadArea.classList.remove(
                    "drag-over"
                );

                if (isConverting) {
                    return;
                }

                const file =
                    event.dataTransfer.files[0];

                if (!file) {
                    return;
                }


                try {

                    validateFile(
                        file,
                        fromFormat
                    );


                    const dataTransfer =
                        new DataTransfer();

                    dataTransfer.items.add(
                        file
                    );

                    converterFile.files =
                        dataTransfer.files;


                    if (selectedFile) {

                        selectedFile.textContent =
                            `Selected: ${file.name}`;
                    }

                } catch (error) {

                    alert(
                        error.message
                    );
                }

            }
        );
    }


    // ==========================================================
    // CONVERT BUTTON
    // ==========================================================

    conversionButton.addEventListener(
        "click",
        async function () {

            if (isConverting) {
                return;
            }


            const file =
                converterFile.files[0];


            if (
                !isConversionAvailable(
                    fromFormat,
                    toFormat
                )
            ) {

                if (conversionMessage) {

                    conversionMessage.textContent =
                        `${fromFormat} → ${toFormat} is not available yet.`;
                }

                return;
            }


            if (!file) {

                alert(
                    `Please select a ${fromFormat} file first.`
                );

                return;
            }


            try {

                validateFile(
                    file,
                    fromFormat
                );

            } catch (error) {

                alert(
                    error.message
                );

                return;
            }


            isConverting = true;

            conversionButton.disabled = true;

            conversionButton.textContent =
                "Converting...";


            if (conversionMessage) {

                conversionMessage.textContent =
                    `Converting ${fromFormat} to ${toFormat}...`;
            }


            try {

                const result =
                    await convertFile(
                        file,
                        fromFormat,
                        toFormat
                    );


                const downloadName =
                    result.fileName ||
                    createDownloadFileName(
                        file.name,
                        toFormat
                    );


                downloadBlob(
                    result.blob,
                    downloadName
                );


                if (conversionMessage) {

                    conversionMessage.textContent =
                        `${fromFormat} → ${toFormat} completed successfully.`;
                }


            } catch (error) {

                console.error(
                    "PDFDOC conversion error:",
                    error
                );


                if (conversionMessage) {

                    conversionMessage.textContent =
                        error.message ||
                        "Conversion failed.";
                }


                alert(
                    error.message ||
                    "Something went wrong during conversion."
                );


            } finally {

                isConverting = false;

                conversionButton.disabled =
                    !isConversionAvailable(
                        fromFormat,
                        toFormat
                    );

                conversionButton.textContent =
                    `Convert ${fromFormat} to ${toFormat}`;
            }

        }
    );


    // ==========================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // ==========================================================

    document.addEventListener(
        "click",
        function (event) {

            if (
                !event.target.closest(
                    ".format-selector"
                )
            ) {

                closeDropdowns();
            }

        }
    );


    // ==========================================================
    // INITIAL UI
    // ==========================================================

    closeDropdowns();

    updateConversionUI();

}


// ============================================================
// INDIVIDUAL TOOL PAGES
// ============================================================

function initializeToolPage() {

    const currentPage =
        getCurrentPage();

    const pageSettings =
        TOOL_PAGES[currentPage];


    if (!pageSettings) {
        return;
    }


    const fileInput =
        document.getElementById(
            "pdf-file"
        );

    const fileName =
        document.getElementById(
            "file-name"
        );

    const convertButton =
        document.getElementById(
            "convert-button"
        );

    const status =
        document.getElementById(
            "status"
        );

    const downloadButton =
        document.getElementById(
            "download-button"
        );


    if (
        !fileInput ||
        !convertButton
    ) {

        return;
    }


    const fromFormat =
        pageSettings.from;

    const toFormat =
        pageSettings.to;


    let isConverting =
        false;

    let downloadURL =
        null;


    // ==========================================================
    // FILE INPUT CONFIGURATION
    // ==========================================================

    const formatInfo =
        getFormatInfo(
            fromFormat
        );


    if (formatInfo) {

        fileInput.accept =
            formatInfo.accept;
    }


    // ==========================================================
    // FILE SELECTED
    // ==========================================================

    fileInput.addEventListener(
        "change",
        function () {

            const file =
                fileInput.files[0];


            if (!file) {

                if (fileName) {

                    fileName.textContent =
                        "No file selected";
                }

                return;
            }


            try {

                validateFile(
                    file,
                    fromFormat
                );


                if (fileName) {

                    fileName.textContent =
                        file.name;
                }


            } catch (error) {

                fileInput.value = "";

                if (fileName) {

                    fileName.textContent =
                        "No file selected";
                }

                alert(
                    error.message
                );
            }

        }
    );


    // ==========================================================
    // CONVERT TOOL PAGE
    // ==========================================================

    convertButton.addEventListener(
        "click",
        async function () {

            if (isConverting) {
                return;
            }


            const file =
                fileInput.files[0];


            if (!file) {

                if (status) {

                    status.textContent =
                        `Please select a ${fromFormat} file first.`;
                }

                return;
            }


            try {

                validateFile(
                    file,
                    fromFormat
                );

            } catch (error) {

                if (status) {

                    status.textContent =
                        error.message;
                }

                return;
            }


            if (
                !isConversionAvailable(
                    fromFormat,
                    toFormat
                )
            ) {

                if (status) {

                    status.textContent =
                        `${fromFormat} → ${toFormat} is not available yet.`;
                }

                return;
            }


            isConverting = true;

            convertButton.disabled = true;

            convertButton.textContent =
                "Converting...";


            if (status) {

                status.textContent =
                    `Converting ${fromFormat} to ${toFormat}...`;
            }


            try {

                const result =
                    await convertFile(
                        file,
                        fromFormat,
                        toFormat
                    );


                const downloadName =
                    result.fileName ||
                    createDownloadFileName(
                        file.name,
                        toFormat
                    );


                if (downloadButton) {

                    if (downloadURL) {

                        URL.revokeObjectURL(
                            downloadURL
                        );
                    }


                    downloadURL =
                        URL.createObjectURL(
                            result.blob
                        );


                    downloadButton.hidden =
                        false;


                    downloadButton.onclick =
                        function () {

                            const link =
                                document.createElement(
                                    "a"
                                );

                            link.href =
                                downloadURL;

                            link.download =
                                downloadName;

                            document.body.appendChild(
                                link
                            );

                            link.click();

                            link.remove();

                        };


                    if (status) {

                        status.textContent =
                            "Conversion complete. Click Download.";
                    }


                } else {

                    downloadBlob(
                        result.blob,
                        downloadName
                    );


                    if (status) {

                        status.textContent =
                            "Conversion complete. Your file has been downloaded.";
                    }
                }


            } catch (error) {

                console.error(
                    "PDFDOC tool error:",
                    error
                );


                if (status) {

                    status.textContent =
                        error.message ||
                        "Conversion failed.";
                }


            } finally {

                isConverting = false;

                convertButton.disabled = false;

                convertButton.textContent =
                    `Convert to ${toFormat}`;
            }

        }
    );


    // ==========================================================
    // CLEANUP
    // ==========================================================

    window.addEventListener(
        "beforeunload",
        function () {

            if (downloadURL) {

                URL.revokeObjectURL(
                    downloadURL
                );
            }

        }
    );

}


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeHomepage();

        initializeToolPage();

    }
);