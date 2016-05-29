var skanky_data = function(nodestart, nodeend) {
    var times = [],
        allLinks = [],
        counter = 0,
        addNodes = function() {
            var ncount = 1
                nodes = d3.range(0, ncount).map(function(n) {
                    return {
                        id: counter++,
                        nodeName: "Node " + n,
                        nodeValue: 1,
                        incoming: []
                    }
                });
            times.push(nodes);
            return nodes;
        },
        addNext = function() {
            var current = times[0][0],
                nextt = addNodes();
                var linkCount = 1,
                    links = {},
                    target, link, x;

                target = nextt[0];
                // add link
                link = {
                    source: current.id,
                    target: target.id,
                    value: current.nodeValue
                };
                links[target.id] = link;
                allLinks.push(link);
                target.nodeValue = link.value;
        }
    // initial set
    addNodes()
    // now add rest
    addNext();
    return {
        times: times,
        links: allLinks
    };
};
