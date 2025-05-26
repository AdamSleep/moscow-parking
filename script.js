let map;
let markers = []; // Массив для хранения маркеров

// Подсчет статистики
function updateStats(spots = parkingSpots) {
  document.getElementById("total-spots").textContent = spots.length;
}

// Фильтрация по количеству мест
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.spots;
    let filteredSpots;

    if (filter === "all") {
      filteredSpots = parkingSpots;
    } else if (filter === "10+") {
      filteredSpots = parkingSpots.filter((spot) => {
        const range = spot.spotsRange;
        const numbers = range.split("-").map(Number);
        return Math.max(...numbers) >= 10;
      });
    } else {
      filteredSpots = parkingSpots.filter((spot) => spot.spotsRange === filter);
    }

    updateParkingList(filteredSpots);
    updateMapMarkers(filteredSpots);
    updateStats(filteredSpots); // Обновляем счетчик для отфильтрованных парковок
  });
});

// Инициализация карты
ymaps.ready(init);

function init() {
  map = new ymaps.Map("map", {
    center: [55.755814, 37.617635], // Центр Москвы
    zoom: 12,
    controls: ["zoomControl"],
  });

  // Добавляем маркеры на карту
  parkingSpots.forEach((spot) => {
    const marker = new ymaps.Placemark(
      spot.coordinates,
      {
        balloonContent: `
          <strong>${spot.address}</strong><br>
          ${spot.description}<br>
          Количество мест: ${spot.spotsRange}
        `,
      },
      {
        preset: "islands#blueAutoIcon",
      }
    );

    marker.events.add("click", () => showNavigationPopup(spot));
    markers.push(marker);
    map.geoObjects.add(marker);
  });

  // Заполняем список парковок
  updateParkingList(parkingSpots);

  // Вызов функции подсчета статистики при загрузке
  updateStats();
}

// Функция обновления маркеров на карте
function updateMapMarkers(spots) {
  // Удаляем все маркеры с карты
  markers.forEach((marker) => map.geoObjects.remove(marker));
  markers = [];

  // Добавляем только отфильтрованные маркеры
  spots.forEach((spot) => {
    const marker = new ymaps.Placemark(
      spot.coordinates,
      {
        balloonContent: `
          <strong>${spot.address}</strong><br>
          ${spot.description}<br>
          Количество мест: ${spot.spotsRange}
        `,
      },
      {
        preset: "islands#blueAutoIcon",
      }
    );

    marker.events.add("click", () => showNavigationPopup(spot));
    markers.push(marker);
    map.geoObjects.add(marker);
  });
}

// Поиск по парковкам
document.querySelector(".search").addEventListener("input", (e) => {
  const searchText = e.target.value.toLowerCase();
  const filteredSpots = parkingSpots.filter(
    (spot) =>
      spot.address.toLowerCase().includes(searchText) ||
      spot.description.toLowerCase().includes(searchText)
  );
  updateParkingList(filteredSpots);
  updateMapMarkers(filteredSpots);
  updateStats(filteredSpots); // Обновляем счетчик при поиске
});

// Обновление списка парковок
function updateParkingList(spots) {
  const list = document.querySelector(".parking-list");
  list.innerHTML = "";

  spots.forEach((spot) => {
    const li = document.createElement("li");
    li.className = "parking-item";
    li.innerHTML = `
      <div class="parking-address">
        <i class="fas fa-map-marker-alt"></i>
        ${spot.address}
      </div>
      <div class="parking-details">
        ${spot.description}<br>
        Количество мест: ${spot.spotsRange}
      </div>
    `;
    li.addEventListener("click", () => showNavigationPopup(spot));
    list.appendChild(li);
  });
}

// Показ всплывающего окна с навигацией
function showNavigationPopup(spot) {
  const popup = document.querySelector(".popup");
  const overlay = document.querySelector(".overlay");
  const address = document.querySelector(".popup-address");
  const details = document.querySelector(".popup-details");

  address.textContent = spot.address;
  details.textContent = `${spot.description} (${spot.spotsRange} мест)`;

  popup.style.display = "block";
  overlay.style.display = "block";

  // Настройка кнопок навигации
  const yandexButton = document.querySelector(".popup-button.yandex");
  const googleButton = document.querySelector(".popup-button.google");
  const dgisButton = document.querySelector(".popup-button.dgis");

  yandexButton.onclick = () => {
    window.open(
      `https://yandex.ru/maps/?rtext=~${spot.coordinates[0]},${spot.coordinates[1]}`,
      "_blank"
    );
  };

  googleButton.onclick = () => {
    window.open(
      `https://www.google.com/maps/dir//${spot.coordinates[0]},${spot.coordinates[1]}`,
      "_blank"
    );
  };

  dgisButton.onclick = () => {
    window.open(
      `https://2gis.ru/moscow?m=${spot.coordinates[1]},${spot.coordinates[0]}/callout`,
      "_blank"
    );
  };
}

// Закрытие всплывающего окна
document.querySelector(".close-popup").addEventListener("click", () => {
  document.querySelector(".popup").style.display = "none";
  document.querySelector(".overlay").style.display = "none";
});

document.querySelector(".overlay").addEventListener("click", () => {
  document.querySelector(".popup").style.display = "none";
  document.querySelector(".overlay").style.display = "none";
});
