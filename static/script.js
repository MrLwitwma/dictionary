document.addEventListener('DOMContentLoaded', async () => {
    const sendButton = document.getElementById('send_button');
    const inputField = document.getElementById('input_field');
    const suggestionBox = document.getElementById('suggestion_box');
    const detailsBox = document.getElementById('details_box');

    // // Function to fetch API key and save it locally
    // async function fetchAPIKey() {
    //     const storedKey = localStorage.getItem("api_key");
    //     if (storedKey) return storedKey; // Use existing key if available

    //     try {
    //         let response = await fetch("https://deepspaceai.pythonanywhere.com/v1/api/create/dictionary", {
    //             method: "POST",
    //         });
    //         let result = await response.json();
    //         if (result.api_key) {
    //             localStorage.setItem("api_key", result.api_key); // Save API key
    //             return result.api_key;
    //         } else {
    //             console.error("Failed to fetch API key:", result);
    //             return null;
    //         }
    //     } catch (error) {
    //         console.error("API key fetch error:", error);
    //         return null;
    //     }
    // }

    // let apiKey = await fetchAPIKey(); // Fetch API key on page load
    let apiKey = '<|serverside|>'

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

    function setupSpeaker(speaker) {
        speaker.addEventListener("click", () => {
            const wordElement = document.getElementById("word");
            if (wordElement) {
                const text = wordElement.textContent.trim();
                if (text) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    speechSynthesis.speak(utterance);
                }
            }
        });
    }

    async function fetchWORD(word) {
        let fetchURL = "https://deepspaceai.pythonanywhere.com/v1/dictionary/get";
        // let fetchURL = "http://127.0.0.1:5000/v1/dictionary/get";

        let loader = document.createElement("div");
        loader.setAttribute('class', 'loader');
        let _ = detailsBox.innerHTML;
        detailsBox.innerHTML = '';
        detailsBox.append(loader);
        detailsBox.innerHTML += _;

        let speaker = document.createElement("img");
        speaker.setAttribute('src', 'static/speaker.svg');
        speaker.setAttribute('class', 'speak');
        setupSpeaker(speaker);

        try {
            let response = await fetch(fetchURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: apiKey, word: word }),
            });

            let data = await response.json();
            let wordData = data.data || data[word];

            if (!wordData) {
                detailsBox.innerHTML = `<strong>No results found for "${word}".</strong> <br> <a href='contribute?word=${word}'>Add word data for ${word}?</a></p>`;
                return;
            }

            let htmlContent = "<p class='error'> </p>";

            if (word !== data.word) {
                htmlContent = `<p class='error'>Found data for <u>${data.word}</u> instead of <u>${word}</u> <a href='contribute?word=${word}'>add word</a></p>`;
            }

            htmlContent += `<p><b>Word:</b> <span id='word'> ${data.word} </span> </p>`;

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
                        for (let i in ant) {
                            htmlContent += `<span class="click-to-insert">${ant[i]}</span>, `;
                        }
                    });
                    htmlContent = htmlContent.replace(/,\s*$/, "");
                    htmlContent += `</li></ul></p>`;
                }

                if (entry.synonym) {
                    htmlContent += `<p><b>Synonyms:</b><ul><li>`;
                    entry.synonym.forEach(syn => {
                        for (let i in syn) {
                            htmlContent += `<span class="click-to-insert">${syn[i]}</span>, `;
                        }
                    });
                    htmlContent = htmlContent.replace(/,\s*$/, "");
                    htmlContent += `</li></ul></p>`;
                }
            }
            htmlContent += `<p><b>Author: </b>${wordData.author}</p>`
            detailsBox.innerHTML = htmlContent;
            detailsBox.append(speaker);

        } catch (error) {
            console.error("Fetch error:", error);
            detailsBox.innerHTML = `<strong>Error:</strong> Unable to fetch results. Please try again later.`;
        }
    }

    async function getSuggestion(word) {
        let fetchURL = "https://deepspaceai.pythonanywhere.com/v1/dictionary/match";
        // let fetchURL = "http://127.0.0.1:5000/v1/dictionary/match";

        try {
            let response = await fetch(fetchURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: apiKey, word: word }),
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
                    suggestionBox.innerHTML = '';
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
            fetchWORD(inputField.value);
        }
    });

});
