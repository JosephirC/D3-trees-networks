import createAdjacencyMatrix from './matrix_management.js';

// Definition de la taille du svg
const margin = { top: 0, right: 30, bottom: 20, left: 10 },
    width = 1960,
    height = 960,
    cellSize = 6,
    decalage_label = 60;


// ajout du svg à une 'div id="matrice"' déjà créee dans la page html
const svg = d3
    .select("#matrice")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Chargement des données
d3.json("data/got_social_graph.json").then((d) => {

  const nodes = d.nodes;
  const edges = d.links;

  const adjacency_matrix = createAdjacencyMatrix(nodes, edges, undefined, true);

  // Trouver le poids maximum pour l'échelle de couleur
  const maxWeight = d3.max(adjacency_matrix, d => d.weight);


  const scale = d3.scaleQuantize()
    .domain([0, maxWeight])
    .range(d3.schemeBlues[9]);


  //.5 Ajout des axes avec les noms des personnages

  // un tableau d'autant d'element que de personnages
  // [0, 1, ..., 106]
  const positionsPersonnages = d3.range(nodes.length);

  // echelle pour positionner les noms
  const echellexy = d3.scaleBand()
    .range([0,nodes.length * cellSize])
    .domain(positionsPersonnages)
    .paddingInner(0.1)
    .align(0)
    .round(true);

  //6. Amélioration du rendu
  const zoneScale = d3.scaleOrdinal(d3.schemeCategory10);

  const opacityScale = d3.scaleLinear()
    .domain([0, maxWeight])
    .range([0, 1]);



  // 4. Afficher une 1e matrice d'adjacence
  const matrixViz = svg
    .selectAll("rect")
    .data(adjacency_matrix)
    .join("rect")

    /*------- Version sans echelle band -------*/
    //.attr("width", cellSize)
    //.attr("height", cellSize)
    /*------- Version avec echelle band -------*/
    .attr("width", echellexy.bandwidth())
    .attr("height", echellexy.bandwidth())

    /*------- Version sans echelle band -------*/
    /*
    .attr("x", function (d) {
      // source → x
      return d.x * cellSize;
    })
    .attr("y", function (d) {
      // target → y
      return d.y * cellSize;
    })
    */

    /*------- Version avec echelle band -------*/
    .attr("x", d => echellexy(d.x)+ decalage_label)
    .attr("y", d => echellexy(d.y) + decalage_label)

    .style("stroke", "white")
    .style("stroke-width", 0.5)
    .style("fill", function (d) {
      if (d.zone_s === d.zone_t) {
        return zoneScale(d.zone_s); // même zone → couleur
      }
      return "#eee";//gris pour meme zone

    })
    .attr("opacity", d => opacityScale(d.weight * 10));


  //.5 Ajout des axes avec les noms des personnages
  const labels = svg
    .append("g")
    .attr("transform", `translate(${decalage_label}, ${decalage_label})`)
    .style("font-size", "5px")
    .style("font-family", "sans-serif");

  const columns = labels
    .append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")

    .attr("x", (d, i) => echellexy(i) + echellexy.bandwidth() / 2)
    .attr("y", - echellexy.bandwidth() / 2)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "middle")
    .text(d => d.character)
    .attr(
      "transform",(d, i) => `rotate( -90, ${echellexy(i) + echellexy.bandwidth() / 2}, ${- echellexy.bandwidth() / 2})`
    );

  const rows = labels
    .append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")

    .attr("x", -2)
    .attr("y", (d, i) => echellexy(i) + echellexy.bandwidth() / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .text(d => d.character);

  // 7 Ré-ordonnancement et animation
  const orderAppearances = d3.range(nodes.length); // ordre par défaut

  const orderZones = nodes
    .map((d, i) => ({ i, zone: d.zone }))
    .sort((a, b) => d3.ascending(a.zone, b.zone))
    .map(d => d.i);

  const orderInfluences = d3.range(nodes.length)
    .sort((a, b) =>
      d3.descending(
        nodes[a].influence ?? 0,
        nodes[b].influence ?? 0
      )
    );


  // 7.1

  // function update(newPositions) {
  //
  //   // Map : index réel du node -> position visuelle
  //   const position = new Map(newPositions.map((d, i) => [d, i]));
  //
  //   // Labels lignes
  //   rows
  //     .attr("y", (d, i) =>
  //       echellexy(position.get(i)) + echellexy.bandwidth() / 2
  //     );
  //
  //   // Labels colonnes
  //   columns
  //     .attr("x", (d, i) =>
  //       echellexy(position.get(i)) + echellexy.bandwidth() / 2
  //     )
  //     .attr("y", -echellexy.bandwidth() / 2)
  //     .attr("transform", (d, i) =>
  //       `rotate(-90,
  //       ${echellexy(position.get(i)) + echellexy.bandwidth() / 2},
  //       ${-echellexy.bandwidth() / 2}
  //     )`
  //     );
  //
  //   // Cellules de la matrice
  //   matrixViz
  //     .attr("x", d => echellexy(position.get(d.x)) + decalage_label)
  //     .attr("y", d => echellexy(position.get(d.y)) + decalage_label);
  // }


  // 7.2 Animation
  function update(newPositions) {

    // Mise à jour du domaine de l’échelle
    echellexy.domain(newPositions);

    const delay = 0;
    const duration = 1000;

    // Labels lignes
    rows
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("y", (d, i) =>
        echellexy(i) + echellexy.bandwidth() / 2
      );

    // Labels colonnes
    columns
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("x", (d, i) =>
        echellexy(i) + echellexy.bandwidth() / 2
      )
      .attr("y", -echellexy.bandwidth() / 2)
      .attr("transform", (d, i) =>
        `rotate(-90,
        ${echellexy(i) + echellexy.bandwidth() / 2},
        ${-echellexy.bandwidth() / 2}
      )`
      );

    // Cellules de la matrice
    matrixViz
      .transition()
      .delay(delay)
      .duration(duration)
      .attr("x", d =>
        echellexy(d.x) + decalage_label
      )
      .attr("y", d =>
        echellexy(d.y) + decalage_label
      );
  }









  d3.select("#visualisation").on("change", function () {
    const value = this.value;

    if (value === "appearances") {
      update(orderAppearances);
    } else if (value === "zones") {
      update(orderZones);
    } else if (value === "influences") {
      update(orderInfluences);
    }
  });


  // 7.2 Animation au chargement


});





