async function selectFolder() {
    try {
        const handle = await window.showDirectoryPicker(); // Opens folder picker
        document.getElementById("folderPath").value = handle.name; // Only stores folder name
    } catch (err) {
        console.error("Folder selection cancelled or failed:", err);
    }
}

document.getElementById("listFilesBtn").addEventListener("click", handleListFiles);

async function handleListFiles() {
    try {
        const response = await fetch("https://web-production-15e92.up.railway.app/list-files");
        
        // If user is not logged in, your backend returns 401
        if (response.status === 401) {
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

// OPTIONAL: If you're actually uploading a file, you'll need an <input type="file"> 
// and use FormData. But if you're just sending a folder name, keep it as is:
async function uploadFiles() {
    const folderName = document.getElementById("folderPath").value;

    if (!folderName) {
        alert("Please select a folder.");
        return;
    }

    try {
        // Replace "https://your-backend-url/process-files" with your real endpoint:
        const response = await fetch("https://web-production-15e92.up.railway.app/upload-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder_path: folderName })
        });

        const result = await response.json();
        document.getElementById("result").innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        console.error("Upload failed:", error);
        document.getElementById("result").innerText = "Error: Failed to fetch";
    }
}
