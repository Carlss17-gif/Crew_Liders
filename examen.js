let examenData;

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const nam = params.get("nom");

fetch("examenes.json")
  .then(res => res.json())
  .then(data => {
    examenData = data[id];

    document.getElementById("titulo").innerText = examenData.area;

    const cont = document.getElementById("preguntas");
    cont.innerHTML = "";

    examenData.preguntas.forEach((p, i) => {
      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `<p>${i + 1}. ${p.texto || ""}</p>`;

      if (p.tipo === "opcion") {
        const opcionesDiv = document.createElement("div");
        opcionesDiv.classList.add("opciones");

        p.opciones.forEach((op, j) => {
          const esImagen = typeof op === "string" && (
            op.endsWith(".jpg") ||
            op.endsWith(".png") ||
            op.endsWith(".jpeg") ||
            op.endsWith(".webp")
          );

          const label = document.createElement("label");

          const input = document.createElement("input");
          input.type = "radio";
          input.name = "p" + i;
          input.value = j;

          label.appendChild(input);

          if (esImagen) {
            const img = document.createElement("img");
            img.src = op;
            img.classList.add("img-opcion");
            label.appendChild(img);
          } else {
            const texto = document.createElement("span");
            texto.innerText = op;
            label.appendChild(texto);
          }

          opcionesDiv.appendChild(label);
        });

        div.appendChild(opcionesDiv);

      } else if (p.subitems && Array.isArray(p.subitems)) {

        const subDiv = document.createElement("div");
        subDiv.classList.add("subpreguntas");

        p.subitems.forEach((item, j) => {
          const grupo = document.createElement("div");
          grupo.classList.add("subpregunta");

          const label = document.createElement("label");
          label.innerText = item;

          const input = document.createElement("input");
          input.type = "text";
          input.id = `p${i}_${j}`;
          input.placeholder = "Escribe tu respuesta...";

          grupo.appendChild(label);
          grupo.appendChild(input);
          subDiv.appendChild(grupo);
        });

        div.appendChild(subDiv);

      } else {
        div.innerHTML += `
          <input type="text" 
            id="p${i}" 
            placeholder="Escribe tu respuesta..."
            class="input-normal">
        `;
      }

      cont.appendChild(div);
    });
  });

async function enviar() {
  let respuestas = [];
  let correctas = 0;

  examenData.preguntas.forEach((p, i) => {

    if (p.tipo === "opcion") {
      const r = document.querySelector(`input[name=p${i}]:checked`);
      const val = r ? parseInt(r.value) : null;

      respuestas.push(val);
      if (val === p.correcta) correctas++;

    } else if (p.subitems && Array.isArray(p.subitems)) {

      let subRespuestas = [];

      p.subitems.forEach((_, j) => {
        const val = document.getElementById(`p${i}_${j}`).value;
        subRespuestas.push(val);
      });

      respuestas.push(subRespuestas);

    } else {
      respuestas.push(document.getElementById(`p${i}`).value);
    }
  });

  alert(`Resultado: ${correctas}/${examenData.preguntas.length}`);

  console.log("RESPUESTAS:", respuestas);
  const { data, error } = await mysupabase
  .from("resultados_examen")
  .insert([
    {
      nombre: nam,
      examen: id,                 
      area: examenData.area,      
      respuestas: respuestas,
      correctas: correctas,       
      total: examenData.preguntas.length
    }
  ]);

if (error) {
  console.error("ERROR SUPABASE:", error);
  alert("Error al guardar");
} else {
  console.log("GUARDADO:", data);
  alert("Examen guardado correctamente");
  window.location.href='Indice.html';
}
}