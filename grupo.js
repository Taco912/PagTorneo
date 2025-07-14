let grupoSeleccionado = null;
let fechaSeleccionada = null;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  grupoSeleccionado = params.get("grupo");

  console.log("grupoSeleccionado:", grupoSeleccionado);

  if (!grupoSeleccionado) {
    alert("Grupo no definido en la URL");
    return;
  }

  document.getElementById("titulo-grupo").textContent = "Grupo: " + grupoSeleccionado;

  cargarFechas();
  cargarTabla();
});

function cargarFechas() {
  fetch(`https://fuchibol-fi0t.onrender.com/api/fechas?grupo=${grupoSeleccionado}`)
    .then(res => res.json())
    .then(data => {
      console.log("Fechas recibidas:", data);
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
      }
    });
}

function cambiarFecha() {
  const selector = document.getElementById("selector-fecha");
  fechaSeleccionada = selector.value;
  cargarFixture();
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
        item.innerHTML = `
          <strong>${p.equipo1?.nombre ?? ''}</strong> ${p.golesEquipo1 ?? '-'} - ${p.golesEquipo2 ?? '-'} <strong>${p.equipo2?.nombre ?? ''}</strong><br>
          <small>${new Date(p.fechaPartido).toLocaleString()}</small>
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
              <td>${e.nombreequipo}</td>
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
