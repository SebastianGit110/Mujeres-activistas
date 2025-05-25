import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export const Graphics = () => {
  const timelineRef = useRef(null);
  const categoriesRef = useRef(null);
  const regionsRef = useRef(null);

  useEffect(() => {
    // Datos de eventos de mujeres activistas (simulados)
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const regions = [
      "Centroamérica",
      "Sudamérica",
      "Caribe",
      "Norteamérica",
      "Europa",
    ];

    // Gráfico 1: Eventos por mes
    const timelineChart = echarts.init(timelineRef.current);
    const timelineOption = {
      title: {
        text: "Eventos de mujeres activistas por mes (2023)",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        data: months,
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
        name: "Número de eventos",
      },
      series: [
        {
          name: "Eventos",
          type: "bar",
          data: [45, 58, 76, 93, 120, 145, 132, 118, 105, 98, 112, 127],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#ff7e5f" },
              { offset: 1, color: "#feb47b" },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#ff4d4d" },
                { offset: 1, color: "#ff7e5f" },
              ]),
            },
          },
        },
      ],
    };

    // Gráfico 2: Distribución por tipo de evento
    const categoriesChart = echarts.init(categoriesRef.current);
    const categoriesOption = {
      title: {
        text: "Distribución por tipo de evento",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "Eventos",
          type: "pie",
          radius: "50%",
          data: [
            { value: 320, name: "Protestas" },
            { value: 240, name: "Talleres" },
            { value: 180, name: "Arte" },
            { value: 275, name: "Denuncias" },
            { value: 210, name: "Cuidado" },
          ],
          itemStyle: {
            borderRadius: 5,
            borderColor: "#fff",
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
      color: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
    };

    // Gráfico 3: Eventos por región
    const regionsChart = echarts.init(regionsRef.current);
    const regionsOption = {
      title: {
        text: "Eventos por región geográfica",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
      },
      yAxis: {
        type: "category",
        data: regions,
      },
      series: [
        {
          name: "Eventos",
          type: "bar",
          data: [320, 290, 150, 180, 210],
          itemStyle: {
            color: function (params: any) {
              const colorList = [
                "#c23531",
                "#2f4554",
                "#61a0a8",
                "#d48265",
                "#91c7ae",
              ];
              return colorList[params.dataIndex];
            },
          },
          label: {
            show: true,
            position: "right",
          },
        },
      ],
    };

    // Aplicar opciones a los gráficos
    timelineChart.setOption(timelineOption);
    categoriesChart.setOption(categoriesOption);
    regionsChart.setOption(regionsOption);

    // Manejar redimensionamiento
    const handleResize = () => {
      timelineChart.resize();
      categoriesChart.resize();
      regionsChart.resize();
    };
    window.addEventListener("resize", handleResize);

    // Limpieza
    return () => {
      window.removeEventListener("resize", handleResize);
      timelineChart.dispose();
      categoriesChart.dispose();
      regionsChart.dispose();
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "20px" }}>
        Acciones de Mujeres Activistas
      </h1>

      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div ref={timelineRef} style={{ width: "100%", height: "400px" }} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div ref={categoriesRef} style={{ width: "100%", height: "400px" }} />
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "300px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div ref={regionsRef} style={{ width: "100%", height: "400px" }} />
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          padding: "20px",
          marginTop: "20px",
        }}
      ></div>
    </div>
  );
};
