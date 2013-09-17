module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/test/test-tags.html'
          ],
          force: true
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.'
        }
      }
    },
    bower: {
      install: {
        options: {
          targetDir: './test/lib',
          cleanup: true
        }
      }
    },
    watch: {
      scripts: {
        files: [
          'tags.js',
          'test/test-tags.html',
          'test/test-tags.js'
        ],
        tasks: ['test']
      }
    },
    html2js: {
      options: {
        base: '.'
      },
      main: {
        src: ['tags.html'],
        dest: 'test/tags-templates.js'
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.registerTask('test', ['bower:install', 'html2js', 'connect', 'qunit']);
  grunt.registerTask('default', ['test']);

  grunt.event.on('qunit.log',
    function (result, actual, expected, message) {
      if (!!result) {
        grunt.log.ok(message);
      }
    });
};
