module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: require('./package.json'),

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
          'src/tags.js',
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
      dist: {
        src: ['templates/tags.html', 'templates/tag.html'],
        dest: 'dist/generated/templates.js',
        module: 'decipher.tags.templates'

      }
    },
    less: {
      dist: {
        options: {
          paths: ["."],
          yuicompress: false
        },
        files: {
          "dist/<%=pkg.name%>-<%=pkg.version%>.css": "less/tags.less"
        }
      }
    },
    uglify: {
      dist: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': [
            'dist/generated/tags.js']
        },
        options: {
          report: 'min',
          sourceMap: 'dist/<%=' +
                     ' pkg.name %>-<%= pkg.version %>.map.js',
          sourceMapRoot: '/',
          sourceMapPrefix: 1,
          sourceMappingURL: 'dist/<%=' +
                            ' pkg.name %>-<%= pkg.version %>.map.js'
        }
      },
      distTpls: {
        files: {
          'dist/<%= pkg.name %>-<%= pkg.version %>-tpls.min.js': [
            'dist/generated/*.js']
        },
        options: {
          report: 'min',
          sourceMap: 'dist/<%=' +
                     ' pkg.name %>-<%= pkg.version %>-tpls.map.js',
          sourceMapRoot: '/',
          sourceMapPrefix: 1,
          sourceMappingURL: 'dist/<%=' +
                            ' pkg.name %>-<%= pkg.version %>-tpls.map.js'
        }
      }
    },
    concat: {
      dist: {
        src: ['dist/generated/tags.js'],
        dest: 'dist/<%=pkg.name%>-<%=pkg.version%>.js'
      },
      distTpls: {
        src: ['dist/generated/templates.js', 'dist/generated/tags.js'],
        dest: 'dist/<%=pkg.name%>-<%=pkg.version%>-tpls.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test',
    ['build', 'bower:install', 'connect', 'qunit']);
  grunt.registerTask('build', ['less', 'html2js', 'concat', 'uglify']);
  grunt.registerTask('default', ['build']);

  grunt.event.on('qunit.log',
    function (result, actual, expected, message) {
      if (!!result) {
        grunt.log.ok(message);
      }
    });
};
