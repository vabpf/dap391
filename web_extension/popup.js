document.getElementById('scrapeButton').addEventListener('click', () => {
    // Show the loading spinner
    document.getElementById('loading-spinner').style.display = 'block';
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: () => {
          // Function to perform the actual scraping (replace with your logic)
          function scrapeData() {
            // *** Your Specific Scraping Logic Here ***
            // Example (assuming product data loads dynamically):
            const productElements = document.querySelectorAll('div.shopee-product-rating__main');
            let scrapedText = ''; // Accumulate scraped text
            productElements.forEach(product => {
              const time = product.querySelector("div.shopee-product-rating__time").textContent.trim();
              const review = product.querySelector('div:nth-child(4)').textContent.trim();
              scrapedText += `${time} - ${review}\n`;
            });
            return scrapedText; 
          }
  
          // Check if the content is likely loaded dynamically
          function contentIsLikelyDynamic() {
            // Add heuristics to detect if the page has dynamic content
            // For example:
            return document.querySelector('.dynamic-content-container') !== null;
          }
  
          // Function to handle the scraped data
          function handleScrapedData(data) {
            const blob = new Blob([data], { type: 'text/plain' }); // Create text blob
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scraped_data.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
  
            // Hide the loading spinner after download starts
            document.getElementById('loading-spinner').style.display = 'none'; 
          }
  
          if (contentIsLikelyDynamic()) {
            // Set up a MutationObserver to detect changes in the DOM
            const observer = new MutationObserver((mutationsList, observer) => {
              for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                  observer.disconnect();
                  const scrapedData = scrapeData();
                  handleScrapedData(scrapedData);
                  break; 
                }
              }
            });
  
            observer.observe(document.body, { childList: true, subtree: true });
  
            // Set a timeout (e.g., 5 seconds) 
            setTimeout(() => {
              observer.disconnect();
              console.warn('Dynamic content loading timed out. Scraping what\'s available.');
              const scrapedData = scrapeData();
              handleScrapedData(scrapedData);
            }, 5000);
  
          } else {
            const scrapedData = scrapeData();
            handleScrapedData(scrapedData);
          }
        }
      });
    });
  });