var Plotly = require('@lib/index');
var PlotlyInternal = require('@src/plotly');
var Lib = require('@src/lib');
var Plots = Plotly.Plots;
var createGraphDiv = require('../assets/create_graph_div');
var destroyGraphDiv = require('../assets/destroy_graph_div');
var fail = require('../assets/fail_test');

describe('Plots.executeAPICommand', function() {
    'use strict';

    var gd;

    beforeEach(function() {
        gd = createGraphDiv();
    });

    afterEach(function() {
        destroyGraphDiv(gd);
    });

    describe('with a successful API command', function() {
        beforeEach(function() {
            spyOn(PlotlyInternal, 'restyle').and.callFake(function() {
                return Promise.resolve('resolution');
            });
        });

        it('calls the API method and resolves', function(done) {
            Plots.executeAPICommand(gd, 'restyle', ['foo', 'bar']).then(function(value) {
                var m = PlotlyInternal.restyle;
                expect(m).toHaveBeenCalled();
                expect(m.calls.count()).toEqual(1);
                expect(m.calls.argsFor(0)).toEqual([gd, 'foo', 'bar']);

                expect(value).toEqual('resolution');
            }).catch(fail).then(done);
        });

    });

    describe('with an unsuccessful command', function() {
        beforeEach(function() {
            spyOn(PlotlyInternal, 'restyle').and.callFake(function() {
                return Promise.reject('rejection');
            });
        });

        it('calls the API method and rejects', function(done) {
            Plots.executeAPICommand(gd, 'restyle', ['foo', 'bar']).then(fail, function(value) {
                var m = PlotlyInternal.restyle;
                expect(m).toHaveBeenCalled();
                expect(m.calls.count()).toEqual(1);
                expect(m.calls.argsFor(0)).toEqual([gd, 'foo', 'bar']);

                expect(value).toEqual('rejection');
            }).catch(fail).then(done);
        });

    });
});

describe('Plots.computeAPICommandBindings', function() {
    'use strict';

    var gd;

    beforeEach(function() {
        gd = createGraphDiv();

        Plotly.plot(gd, [
            {x: [1, 2, 3], y: [1, 2, 3]},
            {x: [1, 2, 3], y: [4, 5, 6]},
        ]);
    });

    afterEach(function() {
        destroyGraphDiv(gd);
    });

    describe('restyle', function() {
        describe('with invalid notation', function() {
            it('with a scalar value', function() {
                var result = Plots.computeAPICommandBindings(gd, 'restyle', [['x']]);
                expect(result).toEqual([]);
            });
        });

        describe('with astr + val notation', function() {
            describe('and a single attribute', function() {
                it('with a scalar value', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', 7]);
                    expect(result).toEqual(['data[0].marker.size', 'data[1].marker.size']);
                });

                it('with an array value and no trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', [7]]);
                    expect(result).toEqual(['data[0].marker.size']);
                });

                it('with trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', 7, [0]]);
                    expect(result).toEqual(['data[0].marker.size']);
                });

                it('with a different trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', 7, [0]]);
                    expect(result).toEqual(['data[0].marker.size']);
                });

                it('with an array value', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', [7], [1]]);
                    expect(result).toEqual(['data[1].marker.size']);
                });

                it('with two array values and two traces specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', [7, 5], [0, 1]]);
                    expect(result).toEqual(['data[0].marker.size', 'data[1].marker.size']);
                });

                it('with traces specified in reverse order', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', [7, 5], [1, 0]]);
                    expect(result).toEqual(['data[1].marker.size', 'data[0].marker.size']);
                });

                it('with two values and a single trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', [7, 5], [0]]);
                    expect(result).toEqual(['data[0].marker.size']);
                });

                it('with two values and a different trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', ['marker.size', [7, 5], [1]]);
                    expect(result).toEqual(['data[1].marker.size']);
                });
            });
        });

        describe('with aobj notation', function() {
            describe('and a single attribute', function() {
                it('with a scalar value', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': 7}]);
                    expect(result).toEqual(['data[0].marker.size', 'data[1].marker.size']);
                });

                it('with trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': 7}, [0]]);
                    expect(result).toEqual(['data[0].marker.size']);
                });

                it('with a different trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': 7}, [1]]);
                    expect(result).toEqual(['data[1].marker.size']);
                });

                it('with an array value', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': [7]}, [1]]);
                    expect(result).toEqual(['data[1].marker.size']);
                });

                it('with two array values and two traces specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': [7, 5]}, [0, 1]]);
                    expect(result).toEqual(['data[0].marker.size', 'data[1].marker.size']);
                });

                it('with traces specified in reverse order', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': [7, 5]}, [1, 0]]);
                    expect(result).toEqual(['data[1].marker.size', 'data[0].marker.size']);
                });

                it('with two values and a single trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': [7, 5]}, [0]]);
                    expect(result).toEqual(['data[0].marker.size']);
                });

                it('with two values and a different trace specified', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': [7, 5]}, [1]]);
                    expect(result).toEqual(['data[1].marker.size']);
                });
            });

            describe('and multiple attributes', function() {
                it('with a scalar value', function() {
                    var result = Plots.computeAPICommandBindings(gd, 'restyle', [{'marker.size': 7, 'text.color': 'blue'}]);
                    expect(result).toEqual(['data[0].marker.size', 'data[1].marker.size', 'data[0].text.color', 'data[1].text.color']);
                });
            });
        });

        describe('with mixed notation', function() {
            it('and nested object and nested attr', function() {
                var result = Plots.computeAPICommandBindings(gd, 'restyle', [{
                    y: [[3, 4, 5]],
                    'marker.size': [10, 20, 25],
                    'line.color': 'red',
                    line: {
                        width: [2, 8]
                    }
                }]);

                // The results are definitely not completely intuitive, so this
                // is based upon empirical results with a codepen example:
                expect(result).toEqual([
                    'data[0].y',
                    'data[0].marker.size',
                    'data[1].marker.size',
                    'data[0].line.color',
                    'data[1].line.color',
                    'data[0].line.width',
                    'data[1].line.width',
                ]);
            });

            it('and traces specified', function() {
                var result = Plots.computeAPICommandBindings(gd, 'restyle', [{
                    y: [[3, 4, 5]],
                    'marker.size': [10, 20, 25],
                    'line.color': 'red',
                    line: {
                        width: [2, 8]
                    }
                }, [1, 0]]);

                // The results are definitely not completely intuitive, so this
                // is based upon empirical results with a codepen example:
                expect(result).toEqual([
                    'data[1].y',
                    'data[1].marker.size',
                    'data[0].marker.size',
                    'data[1].line.color',
                    'data[0].line.color',
                    'data[1].line.width',
                    'data[0].line.width',
                ]);
            });

            it('and more data than traces', function() {
                var result = Plots.computeAPICommandBindings(gd, 'restyle', [{
                    y: [[3, 4, 5]],
                    'marker.size': [10, 20, 25],
                    'line.color': 'red',
                    line: {
                        width: [2, 8]
                    }
                }, [1]]);

                // The results are definitely not completely intuitive, so this
                // is based upon empirical results with a codepen example:
                expect(result).toEqual([
                    'data[1].y',
                    'data[1].marker.size',
                    'data[1].line.color',
                    'data[1].line.width',
                ]);
            });
        });
    });

    describe('relayout', function() {
        describe('with invalid notation', function() {
            it('and a scalar value', function() {
                var result = Plots.computeAPICommandBindings(gd, 'relayout', [['x']]);
                expect(result).toEqual([]);
            });
        });

        describe('with aobj notation', function() {
            it('and a single attribute', function () {
                var result = Plots.computeAPICommandBindings(gd, 'relayout', [{height: 500}]);
                expect(result).toEqual(['layout.height']);
            });

            it('and two attributes', function () {
                var result = Plots.computeAPICommandBindings(gd, 'relayout', [{height: 500, width: 100}]);
                expect(result).toEqual(['layout.height', 'layout.width']);
            });
        });

        describe('with astr + val notation', function() {
            it('and an attribute', function () {
                var result = Plots.computeAPICommandBindings(gd, 'relayout', ['width', 100]);
                expect(result).toEqual(['layout.width']);
            });

            it('and nested atributes', function () {
                var result = Plots.computeAPICommandBindings(gd, 'relayout', ['margin.l', 10]);
                expect(result).toEqual(['layout.margin.l']);
            });
        });

        describe('with mixed notation', function() {
            it('containing aob + astr', function () {
                var result = Plots.computeAPICommandBindings(gd, 'relayout', [{
                    'width': 100,
                    'margin.l': 10
                }]);
                expect(result).toEqual(['layout.width', 'layout.margin.l']);
            });
        });
    });
});
