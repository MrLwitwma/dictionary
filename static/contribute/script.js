document.addEventListener('DOMContentLoaded', ()=>{
  // Function to get query parameters from URL
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // Set the 'word' parameter value into the input field
  window.onload = function () {
    const word = getQueryParam('word'); // Get the 'word' parameter
    if (word) {
      document.getElementById('word').value = word;
    }
  };

  const dataForm = document.getElementById('contributeForm');

  dataForm.addEventListener("submit", async function(event) {
    event.preventDefault();  // Prevent normal form submission

    const formData = new FormData(this);

    // let fetchUrl = "http://127.0.0.1:5000/v1/dictionary/submit"
    let fetchUrl = "https://deepspaceai.pythonanywhere.com/v1/dictionary/submit"
    try {
        const response = await fetch(fetchUrl, {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        alert("Submission successful: " + JSON.stringify(result));

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to submit. Please try again.");
    }
  });
})