function klassTest() {
  debugger;
  var ftor = [1,2,3,4].functor();

  var coyo = $pure.klass('Coyoneda').of('erik');
  var coyo2 = coyo.map(function(x) {
    return [x,x];
  });
  var ftor = coyo2.lower();

  var comp1 = $pure.klass('Compose').of(function(x) {
    return x * 2;
  });
  var comp2 = comp1.map(function(x) {
    return x + 10;
  });
  var ap = $pure.klass('Ap').of(function mapAll(functor) {
    return functor.map(function(x) {
      return [x,x];
    });
  });
  var ftorIO = ftor.map($pure.unit).to('IO');
  var ftorIO2 = ap.ap(ftorIO);
  var ap2 = ap.ap(ftorIO);

  var runIO = $pure.klass('Ap').of(function(io) {
    return io.run();
  });

  var ucfirst = $pure.klass('IO').of(x => x.ucfirst());

  var erik = $pure.klass('Maybe').of('erik');

  ucfirst.ap(erik).chain(x => console.log(x));
}
klassTest();
