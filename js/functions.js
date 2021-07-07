// генерує в випадкові послідовності картки (приймає кількість карток, масив карток та посилання куди вставити картки)
import level from "./level.js";
import gifArray from "./gifs.js";
import { enLanguage } from "./language.js";
import { uaLanguage } from "./language.js";
import { plLanguage } from "./language.js";
import { deLanguage } from "./language.js";
import { jpLanguage } from "./language.js";

const pauseRef = document.querySelector("#pause");
const pauseBtnRef = document.querySelector(".game__pause");

const drawCards = (amount, cards, containerRef) => {
   containerRef.querySelectorAll(".card").forEach((card) => card.remove());
   let collection = [];
   while (!(collection.length === amount)) {
      let random = Math.ceil(Math.random() * cards.length);
      if (!collection.includes(random)) {
         collection.push(random);
      }
      if (collection.length === amount / 2) {
         collection = [...collection, ...collection];
         let setOfCards = collection.slice();
         while (!(setOfCards.length === 0)) {
            random = Math.ceil(Math.random() * cards.length);
            if (setOfCards.includes(random)) {
               let card = cards.find((card) => card.id === random);
               let string = `<div class="card card-${card.id}">
  <picture>
    <source srcset="./img/card-down.webp" type="image/webp"><img
      data-id='${card.id}' src='./img/card-down.png' class="card__back">
  </picture>
  <picture>
    <source srcset="${card.webp}" type="image/webp">
    <img class="card__photo" src="${card.src}" alt="${card.description}" data-id='${card.id}'>
  </picture>
</div>`;
               containerRef.insertAdjacentHTML("beforeend", string);
               setOfCards.splice(setOfCards.indexOf(random), 1);
            }
         }
      }
   }
};
const funcGlob = {};
const state = {};
// починає гру на заданому контейнері карток (контейнер карток, тип гри)
const gamePlay = (container, playerAmount, gameType, currentLevel) => {
   state.ref = "";
   state.id = 0;
   state.position = 1;
   state.blocked = false;
   state.move = 0;
   state.count = [0, 0, 0, 0];
   state.gameState = 0;
   state.gameResult = "";
   const correctRef = document.querySelector(".audio__correct");
   const flipRef = document.querySelector(".audio__flip");
   const removeCards = (event) => {
      event.target.parentNode.nextElementSibling.lastElementChild.classList.add("scaled");
      state.ref.parentNode.nextElementSibling.lastElementChild.classList.add("scaled");
      event.target.parentNode.parentNode.classList.add("hidden");
      state.ref.parentNode.parentNode.classList.add("hidden");
      state.blocked = false;
      setTimeout(() => {
         event.target.parentNode.nextElementSibling.lastElementChild.classList.remove("scaled");
         state.ref.parentNode.nextElementSibling.lastElementChild.classList.remove("scaled");
      }, 300);
   };
   const repairCard = (event) => {
      event.target.parentNode.nextElementSibling.lastElementChild.classList.remove("choosed");
      state.ref.parentNode.nextElementSibling.lastElementChild.classList.remove("choosed");
      event.target.classList.remove("flip");
      state.ref.classList.remove("flip");
      state.blocked = false;
   };
   const playerCount = [...document.querySelectorAll(".game__player-counter")];
   const playerMessage = document.querySelector(".game__player-turn");
   // починає гру при сингл плеєрі і аркаді
   funcGlob.compareCardSingle = (event) => {
      if (state.blocked || !event.target.classList.contains("card__back")) return;
      event.target.classList.add("flip");
      event.target.parentNode.nextElementSibling.lastElementChild.classList.add("choosed");
      if (state.position === 2) {
         if (state.ref === event.target) return;
         if (state.ref.dataset.id === event.target.dataset.id) {
            correctRef.play();
            state.position = 1;
            state.blocked = true;
            setTimeout(removeCards, 400, event);
            state.gameState++;
            if (state.gameState === container.children.length / 2) {
               state.gameResult = "win";
               if (gameType === "arcade") {
                  const levelRef = +window.localStorage.getItem("level");
                  if (currentLevel !== 10) currentLevel === levelRef ? window.localStorage.setItem("level", levelRef + 1) : 1;
                  const btnWrapper = document.querySelector(".arcade__btn-wrapper");
                  for (let i = 0; i < +window.localStorage.getItem("level"); i++) {
                     btnWrapper.children[i].classList.remove("arcade__btn--close");
                  }
                  const arcadeText = document.querySelector(".win__headline-arcade");
                  let result = arcadeText.textContent.split("");
                  const isNull = result.pop();
                  if (isNull === "0") result.pop();
                  result = result.join("");
                  arcadeText.textContent = `${result}${currentLevel}`;
               }
               setTimeout(endGame, 500, 1, container.children.length, gameType, currentLevel);
            }
         }
         if (state.ref.dataset.id !== event.target.dataset.id) {
            state.position = 1;
            state.blocked = true;
            setTimeout(repairCard, 1000, event);
         }
      } else if (state.position === 1) {
         state.ref = event.target;
         state.position = 2;
      }
   };

   // починає гру при мульти плеєрі
   funcGlob.compareCardMulti = (event) => {
      if (state.blocked || !event.target.classList.contains("card__back")) return;
      event.target.classList.add("flip");
      event.target.parentNode.nextElementSibling.lastElementChild.classList.add("choosed");
      if (state.position === 2) {
         if (state.ref === event.target) return;
         if (state.ref.dataset.id === event.target.dataset.id) {
            correctRef.play();
            state.position = 1;
            state.blocked = true;
            setTimeout(removeCards, 400, event);
            state.gameState++;
            playerCount[state.move].textContent++;
            state.count[state.move]++;
            if (state.gameState === container.children.length / 2) {
               state.gameState = 0;
               state.maxCount = 0;
               state.winner = [];
               state.count.map((player) => (state.maxCount = state.maxCount < player ? player : state.maxCount));
               state.count.map((player, index) => (state.maxCount === player ? state.winner.push(index) : 1));
               let string = "Winner:";
               for (const player of state.winner) {
                  string = `${string} player-${player + 1}`;
               }
               document.querySelector(".win__headline").textContent = string;
               playerCount[0].classList.add("game__player-counter--current");

               setTimeout(endGame, 500, 1, container.children.length, gameType);
            }
         } else {
            state.position = 1;
            state.blocked = true;
            playerCount[state.move].classList.remove("game__player-counter--current");
            state.move = state.move === playerAmount - 1 ? 0 : state.move + 1;
            playerCount[state.move].classList.add("game__player-counter--current");

            setTimeout(repairCard, 800, event);
            setTimeout(function () {
               playerMessage.classList.remove("hidden");
               playerMessage.textContent = `Player-${state.move + 1} move`;
            }, 600);
            setTimeout(function () {
               playerMessage.classList.add("hidden");
            }, 1500);
         }
      } else if (state.position === 1) {
         state.ref = event.target;
         state.position = 2;
      }
   };
   state.gameState = 0;
   if (gameType === "singlePlayer" || gameType === "arcade") container.addEventListener("click", funcGlob.compareCardSingle);
   if (gameType === "multiPlayer") {
      container.addEventListener("click", funcGlob.compareCardMulti);
      playerCount[state.move].classList.add("game__player-counter--current");
      playerCount.forEach((count) => (count.textContent = 0));
   }
};
const checkPause = (event) => {
   if (event.code === "Space") {
      document.querySelector(".pause").classList.remove("hidden-modal");
   }
};

// розпочинає гру із заданими параметрами

export const startGame = (cardsAmount, cards, containerRef, timerCount, playerAmount, gameType, currentLevel) => {
   if (gameType === "multiPlayer") pauseBtnRef.classList.add("game__pause--multiPlayer");
   if (gameType === "arcade") cardsAmount = level[currentLevel - 1].cardsAmount;
   state.gameResult = "";
   containerRef.classList.add(`card-container--${cardsAmount}`);
   document.querySelector(".game").classList.remove("hidden-modal");
   drawCards(cardsAmount, cards, containerRef);
   const numbersRef = document.querySelector(".game__start-number-wrapper");
   numbersRef.classList.remove("hidden-modal");
   const countdownRef = document.querySelector(".audio__countdown");
   document.querySelector(".audio__main-theme").pause();
   document.querySelector(".audio__main-theme").currentTime = 0;
   let index = 0;
   countdownRef.play();
   numbersRef.children[index].classList.remove("hidden-modal");
   numbersRef.children[index].classList.add("scaled-number");
   funcGlob.cardsAmount = cardsAmount;
   funcGlob.playerAmount = playerAmount;
   const startNumber = setInterval(() => {
      countdownRef.currentTime = 0;
      countdownRef.play();
      index++;
      numbersRef.children[index - 1].classList.add("hidden-modal");
      if (index === 4) {
         clearInterval(startNumber);
         numbersRef.classList.add("hidden-modal");
         numbersRef.children[index - 1].classList.add("hidden-modal");
         return;
      }
      setTimeout(() => numbersRef.children[index].classList.add("scaled-number"), 200);
      numbersRef.children[index].classList.remove("hidden-modal");
      numbersRef.children[index - 1].classList.remove("scaled-number");
   }, 1300);
   setTimeout(function () {
      countdownRef.pause();
      const gameCounterRef = [...document.querySelectorAll(".game__player-counter")];

      for (let i = 0; i < playerAmount; i++) {
         gameCounterRef[i].classList.remove("hidden");
      }
      const timerRef = document.querySelector(".timer");
      const minutesRef = document.querySelector(".timer__minutes");
      const secondsRef = document.querySelector(".timer__seconds");
      if (gameType === "arcade") {
         timerRef.classList.remove("hidden-modal");
         timer(level[currentLevel - 1].time, minutesRef, secondsRef, level[currentLevel - 1].cardsAmount);
      }
      if (gameType === "singlePlayer") {
         timerRef.classList.remove("hidden-modal");
         timer(timerCount, minutesRef, secondsRef, cardsAmount);
      }

      document.querySelector(".audio__game-play").currentTime = 0;
      document.querySelector(".audio__game-play").play();
      pauseBtnRef.classList.remove("hidden");
      gamePlay(containerRef, playerAmount, gameType, currentLevel);
   }, 5400); 
};

// закінчує гру
const endGame = (timerCount, cardsAmount, gameType, currentLevel, event) => {
   pauseBtnRef.classList.remove("game__pause--multiPlayer");
   document.querySelector(".audio__little-time").pause();
   document.querySelector(".audio__little-time").currentTime = 0;
   pauseBtnRef.classList.add("hidden");
   document.querySelector(".timer").classList.remove("low-time");
   const containerRef = document.querySelector(".card-container");
   containerRef.removeEventListener("click", funcGlob.compareCardSingle);
   containerRef.classList.remove(`card-container--${cardsAmount}`);
   document.querySelector(".game").classList.add("hidden-modal");
   document.querySelector(".audio__game-play").pause();
   document.querySelector(".timer").classList.add("hidden-modal");
   const gameCounterRef = document.querySelectorAll(".game__player-counter");
   containerRef.removeEventListener("click", funcGlob.compareCardMulti);
   containerRef.removeEventListener("click", funcGlob.compareCardSingle);

   for (let i = 0; i < funcGlob.playerAmount; i++) {
      gameCounterRef[i].classList.add("hidden");
   }
   if (state.gameResult === "toMenu") {
      event.target.parentNode.parentNode.classList.add("hidden-modal");
      document.querySelector(".settings").classList.remove("hidden-modal");
      document.querySelector(".audio__main-theme").play();
      setTimeout(function () {
         state.gameResult = "";
      }, 1100);
      return;
   }
   if (timerCount + 1 === 0) {
      document.querySelector(".audio__lose").play();
      document.querySelector(".lose").classList.remove("hidden-modal");
      document.querySelectorAll(".arcade__video")[1].style.display = "block";
      document.querySelectorAll(".arcade__video")[1].currentTime = 0;
      document.querySelectorAll(".arcade__video")[1].play();
      state.gameResult = "";
   } else {
      document.querySelector(".game__congratulation").classList.remove("hidden");
      if (currentLevel === 10) {
         document.querySelector(".win__arcade").classList.remove("hidden-modal");
         document.querySelector(".arcade__video").style.display = "block";
         document.querySelector(".arcade__video").currentTime = 0;
         document.querySelector(".arcade__video").play();
         document.querySelector(".audio__arcade_total_win").currentTime = 0;
         document.querySelector(".audio__arcade_total_win").play();

         return;
      }
      document.querySelector(".audio__won").play();
      gameType === "arcade" ? randomGenerateGifs(document.querySelector(".win__gif--arcade")) : randomGenerateGifs(document.querySelector(".win__gif--non-arcade"));
      gameType === "arcade" ? document.querySelector(".arcade").classList.remove("hidden-modal") : document.querySelector(".win").classList.remove("hidden-modal");
   }
};

// повертається до меню

export const returnToMenu = (event) => {
   state.gameResult = "toMenu";
   document.querySelector(".settings_btn--js").classList.remove("hidden");
   endGame(0, funcGlob.cardsAmount, 0, 0, event);
};

// таймер (кількість часу, посилання на хилини, секунди)

const timer = (timerCount, minutesRef, secondsRef, cardsAmount) => {
   let minutes = (timerCount / 60) % 60;
   let seconds = timerCount % 60 < 10 ? `0${timerCount % 60}` : timerCount % 60;
   if (timerCount <= 10) {
      minutesRef.parentNode.classList.add("low-time");
      document.querySelector(".audio__little-time").play();
   }
   if (state.gameResult) return;
   if (state.gameResult === "win") {
      document.querySelector(".win__headline").textContent = `You won in ${timerCount} seconds`;
      state.gameResult = "";
      return;
   }
   if (timerCount < 0) {
      endGame(timerCount, funcGlob.cardsAmount);
   } else {
      if (pauseRef.classList.contains("hidden-modal")) {
         minutesRef.innerHTML = Math.floor(minutes);
         secondsRef.innerHTML = seconds;
         timerCount--;
      }

      setTimeout(timer, 1000, timerCount, minutesRef, secondsRef);
   }
};

export const randomGenerateGifs = (gifRef) => {
   let random = Math.floor(Math.random() * (gifArray.length - 1));
   const string = `
   <picture>
    <source srcset="${gifArray[random].src}" type="image/webp">
    <img class="win__gif-img ${gifArray[random].class}" src="${gifArray[random].srcGif}" '>
  </picture>`;
   gifRef.innerHTML = string;
};

export const changeLanguageFn = (language) => {
   document.querySelector(".logo_game").textContent = language.subtitleGame;
   document.querySelector(".logo_team").textContent = language.subtitleAuthors;
   document.querySelector(".start__btn-text").textContent = language.buttonTitle;
   document.querySelector(".how-to-play__headline").textContent = language.howToPlayModalTitle;
   document.querySelector(".how-to-play__text").textContent = language.howToPlayModalText;
   document.querySelector(".authors_title").textContent = language.authorsModalTitle;
   document.querySelector(".max_title-js").textContent = language.authorsMaxTitle;
   document.querySelector(".max_text-js").textContent = language.authorsMaxText;
   document.querySelector(".maria_title-js").textContent = language.authorsMariaTitle;
   document.querySelector(".maria_text-js").textContent = language.authorsMariaText;
   document.querySelector(".dima_title-js").textContent = language.authorsDmytroTitle;
   document.querySelector(".dima_text-js").textContent = language.authorsDmytroText;
   document.querySelector(".ihor_title-js").textContent = language.authorsIgorTitle;
   document.querySelector(".ihor_text-js").textContent = language.authorsIgorText;
   document.querySelector(".authors_footer__text").textContent = language.authorsFooterText;
   document.querySelector(".settings-modal__headline").textContent = language.settingsModalTitle;
   document.querySelector(".settings-modal__caption").textContent = language.settingsModalSubtitleSound;
   document.querySelector(".settings-modal-language").textContent = language.settingsModalSubtitleLanguage;
   document.querySelector(".settings-modal__bg").textContent = language.settingsModalSubtitleBackground;
   document.querySelector(".game-type__text-single").textContent = language.startGameModalSinglePlayerSubtitle;
   document.querySelector(".game-type__text-multi").textContent = language.startGameModalMultiPlayerSubtitle;
   document.querySelector(".game-type__text-arcade").textContent = language.startGameModalArcadeSubtitle;
   document.querySelector(".settings__headline").textContent = language.startGameModalAmountOfCardsSubtitle;
   document.querySelector(".settings__headline-time").textContent = language.startGameModalAmountOfTimeSubtitle;
   document.querySelector(".settings__btn05").textContent = language.buttonTitleTime05;
   document.querySelector(".settings__btn1").textContent = language.buttonTitleTime1;
   document.querySelector(".settings__btn2").textContent = language.buttonTitleTime2;
   document.querySelector(".settings__btn3").textContent = language.buttonTitleTime3;
   document.querySelector(".settings__headline-amount-cards").textContent = language.startGameModalAmountOfCardsSubtitle;
   document.querySelector(".settings__headline-amount-players").textContent = language.multiPlayerAmountOfPlayers;
   document.querySelector(".settings__headline-level").textContent = language.arcadeLevelSelect;
   document.querySelector(".settings__start-btn").textContent = language.buttonStartTitle;
   document.querySelector(".pause__headline").textContent = language.modalPausedTitle;
   document.querySelector(".pause__resume").textContent = language.modalButtonResumeTitle;
   document.querySelector(".pause__back-to-menu").textContent = language.modalButtonBackToMenuTitle;
   document.querySelector(".settings_btn-text--js").textContent = language.modalButtonSettingsTitle;
   document.querySelector(".start__how-to-play--js--text").textContent = language.modalButtonHowToPlayTitle;
   document.querySelector(".game__start-number-text").textContent = language.wordBeforeGame;
   document.querySelector(".win__headline").textContent = language.winModalTitle;
   document.querySelector(".win__btn-text").textContent = language.buttonBackToMenu;
   document.querySelector(".win__btn-text-replay").textContent = language.buttonReplayTitle;
   document.querySelector(".win__headline-arcade").textContent = language.winModalArcade;
   document.querySelector(".win__open-menu-js").firstElementChild.textContent = language.winModalArcadeButtonMenuTitle;
   document.querySelector(".win__btn-text-next-level").textContent = language.winModalArcadeButtonNextLevelTitle;
   document.querySelector(".lose_headline").textContent = language.lostModalTitle;
   document.querySelector(".lose-btn-js").textContent = language.modalButtonBackToMenuTitle;
   document.querySelector(".lose-btn-replay").textContent = language.buttonReplayTitle;
   document.querySelector(".win__arcade-headline").textContent = language.lastWinArcadeModal;
   document.querySelector(".win-btn-arcade").textContent = language.buttonBackToMenu;
   document.querySelector(".win-btn-arcade-replay").textContent = language.buttonReplayTitle;
   document.querySelector('.projects__title').textContent = language.titleOurProjects;
   document.querySelector('.projects__subtitle').textContent = language.subTitleOurProjects;
   document.querySelector('.item__link-js1').textContent = language.nameOurProject1;
   document.querySelector('.item__link-js2').textContent = language.nameOurProject2;
};

export const validLanguage = () => {
   if (window.localStorage.getItem("language") === "gb") {
      return changeLanguageFn(enLanguage);
   }
   if (window.localStorage.getItem("language") === "ua") {
      return changeLanguageFn(uaLanguage);
   }
   if (window.localStorage.getItem("language") === "pl") {
      return changeLanguageFn(plLanguage);
   }
   if (window.localStorage.getItem("language") === "de") {
      return changeLanguageFn(deLanguage);
   }
   if (window.localStorage.getItem("language") === "jp") {
      return changeLanguageFn(jpLanguage);
   }
};
