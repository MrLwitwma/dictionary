document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.getElementById('send_button');
    const inputField = document.getElementById('input_field');
    const suggestionBox = document.getElementById('suggestion_box');
    const detailsBox = document.getElementById('details_box');

    sendButton.addEventListener('click', () => {
        let text = inputField.value.trim();
        if (text) fetchWORD(text);
    });

    inputField.addEventListener('input', () => {
        let text = inputField.value.trim();
        if (text) getSuggestion(text);
    });

    inputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            let text = inputField.value.trim();
            if (text) fetchWORD(text);
        }
    });

    async function fetchWORD(word) {
        let fetchURL = "https://deepspaceai.pythonanywhere.com/v1/dictionary/get";
        // let fetchURL = "http://127.0.0.1:5000/v1/dictionary/get"


        let loader = document.createElement("div");
        loader.setAttribute('class', 'loader')
        let _ = detailsBox.innerHTML
        detailsBox.innerHTML = ''
        detailsBox.append(loader)
        detailsBox.innerHTML += _

        try {
            let response = await fetch(fetchURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: "1d1a4b0abb7eff7a265b56db4713660a", word: word }),
            });

            let data = await response.json();
            let wordData = data.data || data[word];

            if (!wordData) {
                detailsBox.innerHTML = `<strong>No results found for "${word}".</strong>`;
                return;
            }

            let htmlContent = ''

            if (word !== data.word){
                htmlContent +=  `<p class='error'>Found data for <u>${data.word}</u> instead of <u>${word}</u></p>`
            }

            htmlContent += `<p><b>Word:</b> ${data.word} </p>`;
            
            for (let type in wordData) {
                if (type === "author") continue;
                let entry = wordData[type];
                htmlContent += `<h3>${type.toUpperCase()}</h3>`;
                htmlContent += `<p><b>Translation:</b> ${entry.translation || "N/A"}</p>`;
                
                if (entry.definition) {
                    htmlContent += `<p><b>Definition:</b><ul>`;
                    entry.definition.forEach(desc => {
                        htmlContent += `<li>${desc.join(", ")}</li>`;
                    });
                    htmlContent += `</ul></p>`;
                }
                
                if (entry.antonym) {
                    htmlContent += `<p><b>Antonyms:</b><ul><li>`;
                    entry.antonym.forEach(ant => {
                        for (i in ant){
                            htmlContent += `<span class="click-to-insert">${ant[i]}}</span>, `
                        }
                    });
                    htmlContent = htmlContent.replace(/,\s*$/, "");
                    htmlContent += `</li></ul></p>`;
                }
                
                if (entry.synonym) {
                    htmlContent += `<p><b>Synonyms:</b><ul><li>`;
                    entry.synonym.forEach(syn => {
                        for (i in syn){
                            htmlContent += `<span class="click-to-insert">${syn[i]}</span>, `
                        }
                    });
                    htmlContent = htmlContent.replace(/,\s*$/, "");
                    htmlContent += `</li></ul></p>`;
                }
            }

            detailsBox.innerHTML = htmlContent;
        } catch (error) {
            console.error("Fetch error:", error);
            detailsBox.innerHTML = `<strong>Error:</strong> Unable to fetch results. Please try again later.`;
        }
    }

    async function getSuggestion(word) {
        let fetchURL = "https://deepspaceai.pythonanywhere.com/v1/dictionary/match";
        // let fetchURL = "http://127.0.0.1:5000/v1/dictionary/match"

        try {
            let response = await fetch(fetchURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: "1d1a4b0abb7eff7a265b56db4713660a", word: word }),
            });

            let data = await response.json();
            suggestionBox.innerHTML = "";

            data.matches.forEach((match) => {
                let suggestionItem = document.createElement("div");
                suggestionItem.textContent = match;
                suggestionItem.classList.add("suggestion-item");

                suggestionItem.addEventListener("click", () => {
                    inputField.value = match;
                    fetchWORD(match);
                    suggestionBox.innerHTML = ''
                });

                suggestionBox.appendChild(suggestionItem);
            });

        } catch (error) {
            console.error("Suggestion fetch error:", error);
        }
    }

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("click-to-insert")) {
            inputField.value = event.target.textContent;
            fetchWORD(inputField.value)
        }
    });
    
});
