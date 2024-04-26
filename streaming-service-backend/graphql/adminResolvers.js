import { GraphQLError } from 'graphql';
import { generateToken } from '../utils/helpers.js';
import Admin from '../models/adminModel.js';
import User from '../models/userModel.js';
import Artist from '../models/artistModel.js';
import Album from '../models/albumModel.js';
import Song from '../models/songModel.js';
import Playlist from '../models/playlistModel.js';

export const adminResolvers = {
  Query: {
    getUserCount: async () => {
      try {
        const users = await User.find().toArray();
        return users.length;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch users: ${error.message}`);
      }
    },
    getArtistCount: async () => {
      try {
        const artists = await Artist.find().toArray();
        return artists.length;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch artists: ${error.message}`);
      }
    },
    getAlbumCount: async () => {
      try {
        const albums = await Album.find().toArray();
        return albums.length;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch albums: ${error.message}`);
      }
    },
    getSongCount: async () => {
      try {
        const songs = await Song.find().toArray();
        return songs.length;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch songs: ${error.message}`);
      }
    },
    getPlaylistCount: async () => {
      try {
        const playlists = await Playlist.find().toArray();
        return playlists.length;
      } catch (error) {
        throw new GraphQLError(`Failed to fetch playlists: ${error.message}`);
      }
    }
  },
  Mutation: {
    loginAdmin: async (_, args) => {
      try {
        const admin = await Admin.findOne({ email: args.email }).select('+password');

        if (!admin) {
          throw new Error('Invalid email or password');
        }

        const isPasswordCorrect = await admin.isPasswordCorrect(args.password, admin.password);

        if (!isPasswordCorrect) {
          throw new Error('Invalid email or password.');
        }

        const token = generateToken(admin._id, 'ADMIN', admin.first_name);

        return { admin, token };
      } catch (error) {
        return {
          admin: null,
          token: null,
          error: {
            message: 'Error logging in admin',
            details: error.message
          }
        }
      }
    }
  }
};