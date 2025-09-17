// This file contains the JavaScript code for the Spotify Clone web player.
// It handles user interactions, such as playing music, navigating through playlists, and updating the UI dynamically.

document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.querySelector('.playBarPlay');
    const prevButton = document.querySelector('.songsButton img[src*="playBarPrev.svg"]');
    const nextButton = document.querySelector('.songsButton img[src*="playBarNext.svg"]');
    const songInfo = document.querySelector('.songInfo');

    let currentSongIndex = 0;
    const songs = [
        {
            title: "Sapphire",
            artist: "Ed Sheeran",
            image: "https://i.scdn.co/image/ab67616d00001e026fbb60d6a7e03ccb940a518e",
            audio: "path/to/audio1.mp3" // Placeholder for audio file
        },
        // Add more songs as needed
    ];

    function updateSongInfo() {
        const song = songs[currentSongIndex];
        songInfo.innerHTML = `<h2>${song.title}</h2><p>${song.artist}</p>`;
    }

    function playSong() {
        const audio = new Audio(songs[currentSongIndex].audio);
        audio.play();
        updateSongInfo();
    }

    playButton.addEventListener('click', playSong);
    prevButton.addEventListener('click', () => {
        currentSongIndex = (currentSongIndex > 0) ? currentSongIndex - 1 : songs.length - 1;
        updateSongInfo();
    });

    nextButton.addEventListener('click', () => {
        currentSongIndex = (currentSongIndex < songs.length - 1) ? currentSongIndex + 1 : 0;
        updateSongInfo();
    });
});