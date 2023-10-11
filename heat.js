import * as d3 from 'd3';

const createGraph = (dji, id) => {
    const width = 928; // width of the chart
    const cellSize = 12; // height of a day
    const height = cellSize * 8; // height of a week (5 days + padding)
  
    // Define formatting functions for the axes and tooltips.
    const formatValue = d3.format("+d");
    const formatDate = d3.timeParse("%Y-%m-%d");
    const formatMonth = d3.utcFormat("%b");
  
    // Helpers to compute a day’s position in the week.
    const timeWeek = d3.utcMonday;
    const countDay = (i) => (i + 6) % 7;
  
    // Compute the values used to color the cells: percent change is the difference between the day’s
    // closing value and the previous day’s, as a fraction of the latter.
    const data = d3.pairs(dji, ({ date, count }) => ({
      date: formatDate(date),
      value: count
    }));

    // Compute the extent of the value, ignore the outliers
    // and define a diverging and symmetric color scale.
    const max = d3.quantile(data, 0.9975, (d) => Math.abs(d.value));
    const color = d3.scaleSequential(d3.interpolatePuOr).domain([-max, +max]);
  
    // Group data by year, in reverse input order. (Since the dataset is chronological,
    // this will show years in reverse chronological order.)
    const years = d3.groups(data, (d) => d.date.getUTCFullYear());
    
    const svg = d3
      .select(`#${id}`)
      .attr("width", width)
      .attr("height", height * years.length)
      .attr("viewBox", [0, 0, width, height * years.length])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const year = svg
      .selectAll("g")
      .data(years)
      .join("g")
      .attr(
        "transform",
        (d, i) => `translate(40.5, ${height * i + cellSize * 1.5})`
      );
  
    year
      .append("text")
      .attr("x", -5)
      .attr("y", -5)
      .attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .text(([key]) => key);

    // circles
    year
      .append("g")
      .selectAll()
      .data(([, values]) =>
        values.filter((d) => ![0, 6].includes(d.date.getUTCDay()))
      )
      .join("circle")
      .attr('r', cellSize / 2 - 2)
      .attr(
        "cx",
        (d) => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 0.5
      )
      .attr("cy", (d) => countDay(d.date.getUTCDay()) * cellSize + 0.5)
      .attr("fill", (d) => color(d.value))
      .append("title")
      .text(
        (d) => `${d.date} - ${formatValue(d.value)} commits`
      );    

    const month = year
      .append("g")
      .selectAll()
      .data(([, values]) =>
        d3.utcMonths(d3.utcMonth(values[0].date), values.at(-1).date)
      )
      .join("g");
  
    month
      .append("text")
      .attr(
        "x",
        (d) => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2
      )
      .attr("y", -8)
      .text(formatMonth);
  
    return Object.assign(svg.node(), { scales: { color } });
}

export {createGraph}