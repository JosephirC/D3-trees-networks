import createAdjacencyMatrix from './matrix_management.js';

// Definition de la taille du svg
const margin = { top: 0, right: 30, bottom: 20, left: 10 },
    width = 1960,
    height = 960;

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

    const adjacency_matrix = createAdjacencyMatrix(nodes, edges);

// Trouver le poids maximum pour l'échelle de couleur
const maxWeight = d3.max(nodes, d => d.influence);

const scale = d3.scaleQuantize()
    .domain([0, maxWeight])
    .range(d3.schemeBlues[9]);



});



