var fs       = require('fs'),
    cssom    = require('cssom'),
    globsync = require('glob-whatev');
    events   = require('events');

var parseStylesheet = require('css-parse')

module.exports = {

    run: function(folderPath) {

      var emitter = new events.EventEmitter();

      var output = {
        selectorsCount: 0,
        fileSize: 0
      };

      var styleSheets = globsync.glob(folderPath +'/**/*.css');
      var styleSheetsCount = styleSheets.length;

      styleSheets.forEach(function(filepath, index) {

        // Calculate file-size
        fs.lstat(filepath, function(err, stats) {
          output.fileSize += stats.size;
        });

        // Calculate selectors count
        fs.readFile(filepath, 'utf-8', function(err, contents) {

          // var rules  = cssom.parse(contents).cssRules;
          var parsedStylesheet = parseStylesheet(contents);
          var selectorCount = parsedStylesheet['stylesheet']['rules'].length
          output.selectorsCount += selectorCount;

          if( index+1 === styleSheetsCount ) {
            emitter.emit('done', output);
          }
        });

      });

      return emitter;

    },


    cli: function() {
      var program = require('commander')

      program
        .version('0.1.0')
        .option('-f, --folder <path>', 'The directory path to analyze.')

        .parse(process.argv)

      if (process.argv.length === 2) {
        console.log('Try running --help for all the options.')
      } else {

        var result = this.run(program.folder);

        result.on('done', function(output) {
          console.log(output);
        })
      }
    }
}
