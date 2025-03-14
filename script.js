async function selectFolder() {
    try {
        const handle = await window.showDirectoryPicker(); // Opens folder picker
        document.getElementById("folderPath").value = handle.name; // Only stores folder name
    } catch (err) {
        console.error("Folder selection cancelled or failed:", err);
    }
}

async function uploadFiles() {
    const folderName = document.getElementById("folderPath").value;

    if (!folderName) {
        alert("Please select a folder.");
        return;
    }

    try {
        const response = await fetch("https://your-backend-url/process-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder_path: folderName }) // Send folder name only
        });

        const result = await response.json();
        document.getElementById("result").innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        console.error("Upload failed:", error);
        document.getElementById("result").innerText = "Error: Failed to fetch";
    }
}
