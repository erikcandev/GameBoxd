const gameList = document.querySelector(".gameList");
const loaderEl = document.getElementById("js-preloader");
const loadMoreGamesBtn = document.querySelector(".main-button")
let nextGameListUrl = null;

const url = `https://api.rawg.io/api/games?key=${APIKEY}&dates=2024-08-01,2025-06-01&ordering=-added`

const getPlatformStr = (platforms) => {
    const platformStr = platforms.map(pl => pl.platform.name).join(", ");
    if (platformStr.length > 30) {
        return platformStr.substring(0, 30) + "...";
    }
    return platformStr;
}

const gameDetailsModal = document.getElementById("gameDetailsModal");
const closeGameDetailsModalBtn = document.getElementById("closeGameDetailsModal");
const modalGameName = document.getElementById("modalGameName");
const modalGameImage = document.getElementById("modalGameImage");
const modalGameDescription = document.getElementById("modalGameDescription");
const modalGameReleased = document.getElementById("modalGameReleased");
const modalGameRating = document.getElementById("modalGameRating");
const statusButtons = document.querySelectorAll(".status-btn");
const reviewTextarea = document.getElementById("reviewText");
const ratingStarsContainer = document.getElementById("ratingStarsContainer");
const submitReviewBtn = document.getElementById("submitReviewBtn");


let currentSelectedRating = 0;
let currentSelectedGameId = null;

gameList.addEventListener("click", async (event) => {
  const gameItem = event.target.closest(".item");
  if (gameItem) {
    const gameId = gameItem.dataset.gameId;
    currentSelectedGameId = gameId;
    await showGameDetailsModal(gameId);
  }
});

async function showGameDetailsModal(gameId) {
  loaderEl.classList.remove("loaded");
  try {
    const response = await fetch(`https://api.rawg.io/api/games/${gameId}?key=${APIKEY}`);
    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);
    const gameDetails = await response.json();
    modalGameName.textContent = gameDetails.name;
    modalGameImage.src = gameDetails.background_image_additional || gameDetails.background_image;
    modalGameImage.alt = gameDetails.name;
    modalGameDescription.innerHTML = gameDetails.description;
    modalGameReleased.textContent = gameDetails.released;
    modalGameRating.textContent = gameDetails.rating;
    resetModalState();
    gameDetailsModal.classList.remove("hidden");
  } catch (error) {
    console.error("Ocorreu um erro ao buscar detalhes do jogo:", error);
    alert("Não foi possível carregar os detalhes do jogo. Tente novamente.");
  } finally {
    loaderEl.classList.add("loaded");
  }
}

closeGameDetailsModalBtn.addEventListener("click", () => {
  gameDetailsModal.classList.add("hidden")
});

gameDetailsModal.addEventListener("click", (event) => {
  if (event.target === gameDetailsModal) {
    gameDetailsModal.classList.add("hidden");
  }
});

statusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    statusButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
    const selectedStatus = button.dataset.status;
    console.log(`Status selecionado para o jogo ${currentSelectedGameId}: ${selectedStatus}`);
  });
});

ratingStarsContainer.addEventListener("click", (event) => {
  const clickedStar = event.target.closest(".star");
  if (clickedStar) {
    const rating = parseInt(clickedStar.dataset.rating);
    currentSelectedRating = rating;
    highlightStars(rating);
  }
});

function highlightStars(rating) {
  const stars = ratingStarsContainer.children;
  for (let i = 0; i < stars.length; i++) {
    stars[i].classList.toggle("selected", i < rating);
  }
}

submitReviewBtn.addEventListener("click", () => {
  const reviewText = reviewTextarea.value.trim();
  const selectedStatusBtn = document.querySelector(".status-btn.selected");
  const status = selectedStatusBtn ? selectedStatusBtn.dataset.status : null;

  if (!currentSelectedGameId) {
    alert("Ocorreu um erro: ID do jogo não encontrado. Por favor, tente novamente.");
    return;
  }

  if (!reviewText && !status && currentSelectedRating === 0) {
    alert("Por favor, escreva uma review, selecione um status ou dê uma avaliação em estrelas para publicar.");
    return;
  }

  console.log("--- Dados para Enviar ao Backend (Simulação) ---");
  console.log("Game ID:", currentSelectedGameId);
  console.log("Review Text:", reviewText);
  console.log("Rating:", currentSelectedRating);
  console.log("Status:", status);

  alert(`Dados para review/status simulados e enviados! Verifique o console. \n Nome do Jogo: ${modalGameName.innerText}\n ID: ${currentSelectedGameId} \n Review: ${reviewText}\n\n Avaliação: ${currentSelectedRating}\n Status: ${status}`);
  gameDetailsModal.classList.add("hidden");
  resetModalState();
});

function resetModalState() {
  reviewTextarea.value = "";
  currentSelectedRating = 0;
  highlightStars(0);
  statusButtons.forEach((btn) => btn.classList.remove("selected"));
//   currentSelectedGameId = null;
}

function loadGames(url) {
  loaderEl.classList.remove("loaded");
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      nextGameListUrl = data.next || null;
      const games = data.results;
      games.forEach((game) => {
        const gameItemEl = `
          <div class="col-lg-3 col-md-6 col-sm-12">
            <div class="item" data-game-id="${game.id}">
              <img src="${game.background_image}" alt="${game.name} image">
              <h4 class="game-name">
                ${game.name}
                <br><span class="platforms">${getPlatformStr(game.parent_platforms)}</span>
              </h4>
              <ul>
                <li><i class="fa fa-star"></i> <span class="rating">${game.rating}</span></li>
                <li><i class="fa-regular fa-calendar"></i> <span class="date">${game.released}</span></li>
              </ul>
            </div>
          </div>
        `;
        gameList.insertAdjacentHTML("beforeend", gameItemEl);
      });
      loaderEl.classList.add("loaded");
      loadMoreGamesBtn.classList.toggle("hidden", !nextGameListUrl);
    })
    .catch((error) => {
      console.log("An error occurred:", error);
    });
}



loadGames(url);

loadMoreGamesBtn.addEventListener("click", ()=>{
    if(nextGameListUrl){
        loadGames(nextGameListUrl);
    }
})
