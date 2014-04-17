module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [
          'src/js/**/*.js',
        ],
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/js/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 1337,
          base: '.',
          hostname: 'localhost',
          keepalive: true
        }
      }
    },
    open: {
      all: {
        // Gets the port from the connect configuration
        path: 'http://localhost:<%= connect.all.options.port%>'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.registerTask('default', ['concat', 'uglify', 'connect']);

};