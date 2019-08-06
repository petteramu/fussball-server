module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        files: [
          {
            expand: true,
            cwd: "./src",
            src: ["**/*.coffee"],
            dest: "./build",
            ext: ".js"
          }
        ]
      }
    },
    copy: {
      main: {
        files: [
          {expand: true, cwd: './src/', src: './**/*.json', dest: './build'},
          {expand: true, cwd: './src/', src: './**/*.js', dest: './build'}
        ]
      }
    },
    watch: {
      files: ['src/**/*.coffee', 'src/**/*.json', 'src/**/*.js'],
      tasks: ['coffee', 'copy', 'run']
    },
    run: {
      your_target: {
        cmd: 'node',
        args: [
          '--inspect',
          'build/server'
        ]
      }
    },
    compress: {
      main: {
        options: {
          archive: 'build.zip'
        },
        files: [
          { expand: true, src: ['./**/*'], cwd: 'build/'},
          { src: ['node_modules/**'], dest: '/' }
        ]
      }
    },
    clean: {
      default: ['./build'],
      build: ['./build.zip']
    }
  });

  // Load the plugin that provides the "coffee compile" task.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-run');

  // Default task(s).
  grunt.registerTask('default', ['clean:default', 'copy', 'coffee', 'watch']);
  grunt.registerTask('build', ['copy', 'coffee', 'clean:build', 'compress']);

};