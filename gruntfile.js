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
        files: [{expand: true, cwd: './src/', src: './**/*.json', dest: './build'}]
      }
    },
    watch: {
      files: ['src/**/*.coffee', 'src/**/*.json'],
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
    }
  });

  // Load the plugin that provides the "coffee compile" task.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-run');

  // Default task(s).
  grunt.registerTask('default', ['copy', 'coffee', 'watch']);

};