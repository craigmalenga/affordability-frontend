async function uploadFiles() {
    let folderPath = document.getElementById("folderPath").value;

    // Extract only the folder name, not full path
    let folderName = folderPath.split("\\").pop(); 

    if (!folderName) {
        alert("Please enter a valid folder name.");
        return;
    }

    const response = await fetch("https://web-production-15e92.up.railway.app/process-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_path: folderName }),
    });

    const result = await response.json();
    document.getElementById("result").innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
}
