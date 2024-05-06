import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import axios from "axios";
import queries from "@/utils/queries";
import { MusicGenres } from "@/utils/helpers";
import { useFormState } from "react-dom";
import { createAlbum, updateAlbum } from "@/app/actions.js";
import { useQuery } from "@apollo/client";
const initialState = {
  message: null,
};

const CreateAlbumModal: React.FC<{
  setShowModal: (show: boolean) => void;
  artistId: string;
}> = ({ setShowModal, artistId }) => {
  const [albumData, setAlbumData] = useState({
    album_type: "ALBUM",
    title: "",
    description: "",
    release_date: "",
    genres: [],
    visibility: "PUBLIC",
    coverImageUrl: "",
    artists: [artistId],
    songs: [],
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [error, setError] = useState("");
  const {
    loading,
    songsError,
    data: songsData,
  } = useQuery(queries.GET_SONGS_BY_ARTIST, {
    variables: { artistId: "6637f1095b8e3013e644d7f4" },
  });
  console.log(`--------------- ${songsData}`);
  //const [addAlbum] = useMutation(queries.ADD_ALBUM);
  const [createAlbumFormState, createAlbumFormAction] = useFormState(
    createAlbum,
    initialState
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "releaseDate") {
      const formattedDate = new Date(value).toISOString().split("T")[0];

      setAlbumData((prevData) => ({
        ...prevData,
        release_date: formattedDate,
      }));
    } else {
      setAlbumData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleGenreChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, options } = e.target;
    const selectedGenres = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setAlbumData((prevData) => ({
      ...prevData,
      [name]: selectedGenres,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setCoverImageFile(file);
    await uploadFile(file);
  };

  const handleSubmit = async () => {
    try {
      await createAlbumFormAction(albumData);
      console.log("New album created:", createAlbumFormState.result);
      //setShowModal(false);
    } catch (error) {
      console.error("Error creating new album:", error);
      setError(error.message);
    }
  };

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:4000/file/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const id = response.data.fileId;
      setAlbumData({ ...albumData, coverImageUrl: id });
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error.message);
    }
  };

  const handleSongChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSongIds = Array.from(e.target.options)
      .filter((option) => option.selected)
      .map((option) => option.value);

    setAlbumData((prevData) => ({
      ...prevData,
      [e.target.name]: selectedSongIds,
    }));
  };

  if (loading) {
    return <div>Loading Songs</div>;
  }

  if (songsError) {
    return <div>Error Loading Songs</div>;
  }

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-stone-400 rounded-lg shadow-md w-6/12 p-4 overflow-y-auto h-4/5">
        <div>
          <h2 className="text-2xl font-semibold mb-4">New Album Details</h2>
        </div>
        {createAlbumFormState && createAlbumFormState?.errorMessages && (
          <div
            class="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
            role="alert"
          >
            {createAlbumFormState?.errorMessages?.map((msg, index) => {
              return (
                <p className="error" key={index}>
                  {msg}
                </p>
              );
            })}
          </div>
        )}

        <div className="p-1 text-black overflow-y-auto h-6/12">
          {/* Album form fields */}
          <div className="mb-4">
            <label
              htmlFor="album_type"
              className="block text-gray-700 font-semibold mb-2"
            >
              Album Type
            </label>
            <select
              id="album_type"
              name="album_type"
              value={albumData.album_type}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="ALBUM">ALBUM</option>
              <option value="SINGLE">SINGLE</option>
              <option value="COMPILATION">COMPILATION</option>
              <option value="APPEARS_ON">APPEARS ON</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 font-semibold mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={albumData.title}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 font-semibold mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={albumData.description}
              onChange={handleInputChange}
              rows="4"
              className="border border-gray-300 rounded-md p-2 w-full"
            ></textarea>
          </div>
          <div className="mb-4">
            <label
              htmlFor="release_date"
              className="block text-gray-700 font-semibold mb-2"
            >
              Release Date
            </label>
            <input
              type="date"
              id="release_date"
              name="release_date"
              value={albumData.release_date}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="genres"
              className="block text-gray-700 font-semibold mb-2"
            >
              Genres
            </label>
            <select
              id="genres"
              name="genres"
              value={albumData.genres}
              onChange={handleGenreChange}
              className="border border-gray-300 rounded-md p-2 w-full"
              multiple
            >
              {MusicGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="visibility"
              className="block text-gray-700 font-semibold mb-2"
            >
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              value={albumData.visibility}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="coverImageUrl"
              className="block text-gray-700 font-semibold mb-2"
            >
              Cover Image Upload
            </label>
            <input
              type="file"
              id="coverImageUrl"
              name="coverImageUrl"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="songs"
              className="block text-gray-700 font-semibold mb-2"
            >
              Songs
            </label>
            <select
              id="songs"
              name="songs"
              value={albumData.songs}
              onChange={handleSongChange}
              className="border border-gray-300 rounded-md p-2 w-full"
              multiple
            >
              {songsData.getSongsByArtistID
                .filter((song) => song.album === null)
                .map((song) => (
                  <option key={song._id} value={song._id}>
                    {song.title}
                  </option>
                ))}
            </select>
          </div>
          {/* Additional input fields */}
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none mr-2"
          >
            Submit
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAlbumModal;
