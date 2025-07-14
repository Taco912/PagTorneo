let grupoSeleccionado = null;
let fechaSeleccionada = null;
let fechasDisponibles = [];


document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  grupoSeleccionado = params.get("grupo");

  console.log("grupoSeleccionado:", grupoSeleccionado);

  if (!grupoSeleccionado) {
    alert("Grupo no definido en la URL");
    return;
  }

 

  cargarFechas();
  cargarTabla();
});

function cargarFechas() {
  fetch(`https://fuchibol-fi0t.onrender.com/api/fechas?grupo=${grupoSeleccionado}`)
    .then(res => res.json())
    .then(data => {
      fechasDisponibles = data;
      const selector = document.getElementById("selector-fecha");
      selector.innerHTML = '';
      data.forEach(fecha => {
        const opt = document.createElement("option");
        opt.value = fecha.id;
        opt.textContent = fecha.nombre;
        selector.appendChild(opt);
      });
      if (data.length > 0) {
        fechaSeleccionada = data[0].id;
        selector.value = fechaSeleccionada;
        cargarFixture();
        actualizarBotonesNavegacion();
      }
    });
}

function cambiarFecha() {
  const selector = document.getElementById("selector-fecha");
  fechaSeleccionada = selector.value;
  cargarFixture();
  actualizarBotonesNavegacion();
}

function navegarFecha(direccion) {
  const indexActual = fechasDisponibles.findIndex(f => f.id == fechaSeleccionada);
  const nuevoIndex = indexActual + direccion;
  if (nuevoIndex >= 0 && nuevoIndex < fechasDisponibles.length) {
    fechaSeleccionada = fechasDisponibles[nuevoIndex].id;
    document.getElementById("selector-fecha").value = fechaSeleccionada;
    cargarFixture();
    actualizarBotonesNavegacion();
  }
}

function actualizarBotonesNavegacion() {
  const indexActual = fechasDisponibles.findIndex(f => f.id == fechaSeleccionada);
  document.getElementById("btn-anterior").disabled = indexActual <= 0;
  document.getElementById("btn-siguiente").disabled = indexActual >= fechasDisponibles.length - 1;
}

function cargarFixture() {
  fetch(`https://fuchibol-fi0t.onrender.com/api/partidos/fixture?fechaId=${fechaSeleccionada}&grupo=${grupoSeleccionado}`)
    .then(res => res.json())
    .then(data => {
      console.log("Fixture recibido:", data);
      const fixtureDiv = document.getElementById("fixture");
      fixtureDiv.innerHTML = '';
      if (data.length === 0) {
        fixtureDiv.innerHTML = "<p>No hay partidos para esta fecha</p>";
        return;
      }
      data.forEach(p => {
        const item = document.createElement("div");
        item.className = "fixture-item";
       
        const equipoLocal = p.equipo1?.nombre || "Equipo 1";
        const equipoVisitante = p.equipo2?.nombre || "Equipo 2";
        const golesLocal = p.golesEquipo1 ?? "-";
        const golesVisitante = p.golesEquipo2 ?? "-";

        const fecha = new Date(p.fechaPartido);
        const fechaStr = fecha.toISOString().split('T')[0];
        let estado = "";
        if (fechaStr === "2020-01-01") {
          estado = "Finalizado";
        } else if (fechaStr === "2020-02-02") {
          estado = "A Programar";
        } else {
          estado = fecha.toLocaleString();
        }

        item.innerHTML = `
          <div class="fixture-team-left"><strong>${equipoLocal}</strong></div>
          <div class="fixture-score">${golesLocal} - ${golesVisitante}<br><small>${estado}</small></div>
          <div class="fixture-team-right"><strong>${equipoVisitante}</strong></div>
        `;
        fixtureDiv.appendChild(item);
      });
    });
}

function cargarTabla() {
  fetch(`https://fuchibol-fi0t.onrender.com/api/tabla?grupo=${grupoSeleccionado}`)
    .then(res => res.json())
    .then(data => {
      console.log("Tabla recibida:", data);
      const tablaDiv = document.getElementById("tabla");
      if (!data.length) {
        tablaDiv.innerHTML = "<p>No hay datos</p>";
        return;
      }
      const table = document.createElement("table");
      table.innerHTML = `
        <thead>
          <tr>
            <th>Equipo</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th>
            <th>GF</th><th>GC</th><th>DG</th><th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(e => `
            <tr>
              <td>${e.nombreEquipo}</td>
              <td>${e.pj}</td>
              <td>${e.pg}</td>
              <td>${e.pe}</td>
              <td>${e.pp}</td>
              <td>${e.gf}</td>
              <td>${e.gc}</td>
              <td>${e.gf - e.gc}</td>
              <td>${e.puntos}</td>
            </tr>`).join('')}
        </tbody>
      `;
      tablaDiv.innerHTML = '';
      tablaDiv.appendChild(table);
    });
}
