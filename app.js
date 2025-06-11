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
      if (!titulo) return alert(textos[idioma].ingresaTitulo); // Validación

      resultDiv.innerHTML = ''; // Limpiar resultados previos
      detalleDiv.innerHTML = '';
      setLoading(true); // Mostrar "cargando..."

      try {
        // Fetch a OpenLibrary
        const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(titulo)}`);
        const data = await res.json();

        if (!data.docs || data.docs.length === 0) {
          resultDiv.innerHTML = `<p>${textos[idioma].noEncontrado}</p>`;
          return;
        }

        // Mostrar resultados de libros
        resultDiv.innerHTML = '<h3>Resultados de Libros:</h3>';
        data.docs.slice(0, 5).forEach((libro) => {
          resultDiv.innerHTML += `
            <div class="item">
              <strong>${libro.title}</strong> (${libro.first_publish_year || '–'})<br>
              Autor(es): ${libro.author_name?.join(', ') || '–'}<br>
              <button onclick="verDetalleLibro('${libro.title.replace(/'/g, "\\'")}')">${textos[idioma].verDescripcion}</button>
            </div><hr>`;
        });
      } catch {
        resultDiv.innerHTML = `<p>${textos[idioma].errorConsulta}</p>`;
      } finally {
        setLoading(false); // Ocultar "cargando..."
      }
    }

    // Ver detalles de un libro específico
    async function verDetalleLibro(titulo) {
      detalleDiv.innerHTML = '';
      setLoading(true);

      try {
        const res = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(titulo)}`);
        const libro = (await res.json()).docs[0];
        const descripcion = libro.first_sentence?.join(' ') || 'No hay descripción disponible.';
        detalleDiv.innerHTML = `
          <h3>${textos[idioma].descripcion} "${libro.title}"</h3>
          <p>${descripcion}</p>`;
      } catch {
        detalleDiv.innerHTML = `<p>${textos[idioma].errorConsulta}</p>`;
      } finally {
        setLoading(false);
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