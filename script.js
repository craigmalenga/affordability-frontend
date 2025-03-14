async function uploadFiles() {
    const folderPath = document.getElementById("folderPath").value;

    if (!folderPath) {
        alert("Please enter a folder path.");
        return;
    }

    try {
        const response = await fetch("https://web-production-15e92.up.railway.app/process-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder_path: folderPath }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        document.getElementById("result").innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        document.getElementById("result").innerHTML = `<pre>Error: ${error.message}</pre>`;
    }
}
