async function selectFolder() {
    try {
        const handle = await window.showDirectoryPicker(); // Opens folder picker
        document.getElementById("folderPath").value = handle.name; // Only stores folder name
    } catch (err) {
        console.error("Folder selection cancelled or failed:", err);
    }
}

// Single button: "List SharePoint Files"
document.getElementById("listFilesBtn").addEventListener("click", handleListFiles);

async function handleListFiles() {
    try {
        const response = await fetch("https://web-production-15e92.up.railway.app/list-files");

        // If the user is not logged in, the backend will return a 401
        if (response.status === 401) {
            // Redirect to login so the user can authenticate
            window.location.href = "https://web-production-15e92.up.railway.app/login";
            return;
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(JSON.stringify(err));
        }

        const data = await response.json();
        renderFileList(data.value);
    } catch (error) {
        console.error("Error listing files:", error);
        alert("Failed to list files. Check console.");
    }
}

function renderFileList(files) {
    const container = document.getElementById("filesContainer");
    container.innerHTML = "";
    files.forEach(file => {
        const div = document.createElement("div");
        div.textContent = file.name;
        container.appendChild(div);
    });
}

async function uploadFiles() {
    const folderName = document.getElementById("folderPath").value;
    if (!folderName) {
        alert("Please select a folder.");
        return;
    }
    try {
        const response = await fetch("https://web-production-15e92.up.railway.app/upload-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder_path: folderName }) // Adjust payload if necessary
        });
        const result = await response.json();
        document.getElementById("result").innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        console.error("Upload failed:", error);
        document.getElementById("result").innerText = "Error: Failed to fetch";
    }
}
