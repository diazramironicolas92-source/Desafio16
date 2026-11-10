const montoInput = document.getElementById("montoCLP");
const monedaSelect = document.getElementById("tipoMoneda");
const btnBuscar = document.getElementById("btnBuscar");
const resultadoH3 = document.getElementById("resultado");
const errorSpan = document.getElementById("errorSpan");

let miGrafica = null;

btnBuscar.addEventListener("click", async () => {
    errorSpan.textContent = "";

    const monto = Number(montoInput.value);
    const moneda = monedaSelect.value;

    if (!Number.isFinite(monto) || monto <= 0) {
        errorSpan.textContent = "Por favor, ingrese un monto válido.";
        return;
    }

    if (!moneda) {
        errorSpan.textContent = "Por favor, seleccione una moneda.";
        return;
    }

    try {
        const res = await fetch(`https://mindicador.cl/api/${moneda}`);

        if (!res.ok) {
            throw new Error(`La API respondió con estado ${res.status}.`);
        }

        const data = await res.json();

        if (!data.serie || data.serie.length === 0) {
            throw new Error("No se encontraron datos para esa moneda.");
        }

        const valorMoneda = data.serie[0].valor;
        const resultadoConversion = monto / valorMoneda;

        resultadoH3.textContent =
            `Resultado: ${resultadoConversion.toFixed(2)} ${moneda}`;

        renderizarGrafico(data.serie, moneda);
    } catch (error) {
        errorSpan.textContent = `No se pudo realizar la conversión: ${error.message}`;
    }
});

function renderizarGrafico(serieHistorica, nombreMoneda) {
    const ultimos10 = serieHistorica.slice(0, 10).reverse();

    const dataConfig = {
        labels: ultimos10.map(item =>
            new Date(item.fecha).toLocaleDateString("es-CL")
        ),
        datasets: [{
            label: `Histórico de los últimos 10 días / ${nombreMoneda}`,
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgb(255, 99, 132)",
            data: ultimos10.map(item => item.valor)
        }]
    };

    const config = {
        type: "line",
        data: dataConfig
    };

    const ctx = document.getElementById("myChart").getContext("2d");

    if (miGrafica) {
        miGrafica.destroy();
    }

    miGrafica = new Chart(ctx, config);
}