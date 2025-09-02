let count = 0;
    const countDisplay = document.getElementById("countDisplay");
    const statusText = document.getElementById("statusText");

    const updateUI = () => {
      countDisplay.textContent = count;

      if (count > 0) {
        statusText.textContent = "Positive";
        statusText.className = "font-semibold text-green-600";
        countDisplay.className = "w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-emerald-600 text-white text-3xl font-bold mx-auto mb-3";
      } else if (count < 0) {
        statusText.textContent = "Negative";
        statusText.className = "font-semibold text-red-600";
        countDisplay.className = "w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-r from-red-400 to-pink-600 text-white text-3xl font-bold mx-auto mb-3";
      } else {
        statusText.textContent = "Zero";
        statusText.className = "font-semibold text-gray-600";
        countDisplay.className = "w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-purple-600 text-white text-3xl font-bold mx-auto mb-3";
      }
    };

    document.getElementById("incrementBtn").addEventListener("click", () => {
      count++;
      updateUI();
    });

    document.getElementById("decrementBtn").addEventListener("click", () => {
      count--;
      updateUI();
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
      count = 0;
      updateUI();
    });

    updateUI();