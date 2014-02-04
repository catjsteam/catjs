module.exports = {

    cat: {

        comment: function (lines, mark) {

            var newlines = [], counter = 0;

            function _getValue(obj, key) {
                if (key in obj && obj[key]) {
                    return obj[key];
                }
                return;
            }

            if (lines) {

                if (mark) {

                    lines.forEach(function (line) {

                        if (counter === 0) {
                            newlines[counter] = _getValue(mark, "prefix") + lines[counter];

                        }

                        if (counter === lines.length - 1) {
                            newlines[counter] = lines[counter] + _getValue(mark, "suffix");

                        }

                        if (counter > 0 && counter < lines.length - 1) {
                            newlines[counter] = lines[counter];
                        }

                        newlines[counter] += "\n";
                        counter++;
                    });

                } else {
                    newlines = newlines.concat(lines);

                }
            }

            return newlines;
        }
    }
};
