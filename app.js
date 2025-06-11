const resultDiv = document.getElementById('result');
const detalleDiv = document.getElementById('detalle');
const loadingDiv = document.getElementById('loading');


    // Textos disponibles (sólo Español en este ejemplo)
    const textos = {
      es: {
        titulo: "📚🎬 Buscador de Libros y Películas",
        placeholder: "Escribe el título...",
        btnBuscarLibro: "Buscar Libro",
        btnBuscarPelicula: "Buscar Película",
        cargando: "🔄 Cargando...",
        ingresaTitulo: "Por favor, ingresa un título.",
        noEncontrado: "No se encontró ningún resultado.",
        errorConsulta: "Error al consultar datos.",
        descripcion: "Descripción:",
        verDescripcion: "Ver descripción"
      }
    };

    // Idioma actual
    let idioma = 'es';

    // Aplica los textos al HTML según el idioma seleccionado
    function aplicarTextos() {
      const t = textos[idioma];
      document.getElementById('titulo').textContent = t.titulo;
      document.getElementById('searchInput').placeholder = t.placeholder;
      document.getElementById('btnLibro').textContent = t.btnBuscarLibro;
      document.getElementById('btnPelicula').textContent = t.btnBuscarPelicula;
      loadingDiv.textContent = t.cargando;
    }

    // Mostrar u ocultar el indicador de carga
    function setLoading(on) {
      loadingDiv.classList.toggle('hidden', !on);
    }

    // Buscar libros usando la API de OpenLibrary
    async function buscarLibro() {
      const titulo = document.getElementById('searchInput').value.trim();
      if (!titulo) return alert(textos[idioma].ingresaTitulo);

      resultDiv.innerHTML = '';
      detalleDiv.innerHTML = '';
      setLoading(true);

      try {
        const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(titulo)}`);
        const data = await res.json();

        if (!data.docs || data.docs.length === 0) {
          resultDiv.innerHTML = `<p>${textos[idioma].noEncontrado}</p>`;
          return;
        }

        resultDiv.innerHTML = '<h3>Resultados de Libros:</h3>';
        data.docs.slice(0, 5).forEach((libro, idx) => {
          // Cada resultado tiene un div para la descripción con id único
          resultDiv.innerHTML += `
            <div class="item">
              <strong>${libro.title}</strong> (${libro.first_publish_year || '–'})<br>
              Autor(es): ${libro.author_name?.join(', ') || '–'}<br>
              <button onclick="verDetalleLibro('${libro.key}', 'desc${idx}', this)">${textos[idioma].verDescripcion}</button>
              <div id="desc${idx}" class="descripcion-libro"></div>
            </div><hr>`;
        });
      } catch {
        resultDiv.innerHTML = `<p>${textos[idioma].errorConsulta}</p>`;
      } finally {
        setLoading(false);
      }
    }

    // Mostrar la descripción debajo del título correspondiente
    async function verDetalleLibro(key, descId, btn) {
      const descDiv = document.getElementById(descId);
      if (!descDiv) return;

      // Si ya hay descripción visible, la ocultamos y restauramos el botón
      if (descDiv.dataset.visible === "true") {
        descDiv.innerHTML = "";
        descDiv.dataset.visible = "false";
        btn.textContent = textos[idioma].verDescripcion;
        return;
      }

      descDiv.innerHTML = 'Cargando descripción...';

      try {
        const res = await fetch(`https://openlibrary.org${key}.json`);
        const data = await res.json();

        let descripcion = 'No hay descripción disponible.';
        if (typeof data.description === 'string') {
          descripcion = data.description;
        } else if (typeof data.description === 'object' && data.description.value) {
          descripcion = data.description.value;
        }

        descDiv.innerHTML = `<p>${descripcion}</p>`;
        descDiv.dataset.visible = "true";
        btn.textContent = "Cerrar descripción";
      } catch {
        descDiv.innerHTML = `<p>Error al obtener la descripción.</p>`;
        descDiv.dataset.visible = "true";
        btn.textContent = "Cerrar descripción";
      }
    }

    // Buscar películas usando OMDB API
    async function buscarPelicula() {
      const titulo = document.getElementById('searchInput').value.trim();
      if (!titulo) return alert(textos[idioma].ingresaTitulo);

      resultDiv.innerHTML = '';
      detalleDiv.innerHTML = '';
      setLoading(true);

      try {
        const apikey = 'dda5ba03'; // API Key de ejemplo (OMDB)
        const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(titulo)}&apikey=${apikey}`);
        const data = await res.json();

        if (data.Response === "False") {
          resultDiv.innerHTML = `<p>${textos[idioma].noEncontrado}</p>`;
          return;
        }

        // Mostrar datos de la película
        resultDiv.innerHTML = `
          <h2>🎬 ${data.Title}</h2>
          <p><strong>Año:</strong> ${data.Year}</p>
          <p><strong>Director:</strong> ${data.Director}</p>
          <p><strong>${textos[idioma].descripcion}</strong> ${data.Plot || 'No disponible'}</p>`;
      } catch {
        resultDiv.innerHTML = `<p>${textos[idioma].errorConsulta}</p>`;
      } finally {
        setLoading(false);
      }
    }

    // Al cargar la página se aplican los textos
    window.onload = aplicarTextos;