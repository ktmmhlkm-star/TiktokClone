import { Video } from 'expo-av'
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useUser } from '../../../hooks/useUser'
import PostSingleOverlay from './overlay'
import styles from './styles'

export const PostSingle = forwardRef(({ item }, parentRef) => {
    const ref = useRef(null)
    const user = useUser(item.creator).data

    useImperativeHandle(parentRef, () => ({
        play,
        unload,
        stop
    }))

    useEffect(() => () => unload(), [])

    const play = async () => {
        if (!ref.current) return

        try {
            const status = await ref.current.getStatusAsync()
            if (!status?.isPlaying) {
                await ref.current.setPositionAsync(0)
                await ref.current.playAsync()
            }
        } catch (error) {
            console.log(error)
        }
    }

    const stop = async () => {
        if (!ref.current) return

        try {
            const status = await ref.current.getStatusAsync()
            if (status?.isPlaying) await ref.current.pauseAsync()
        } catch (error) {
            console.log(error)
        }
    }

    const unload = async () => {
        if (!ref.current) return

        try {
            await ref.current.unloadAsync()
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <PostSingleOverlay user={user} post={item} />
            <Video
                ref={ref}
                style={styles.container}
                resizeMode={Video.RESIZE_MODE_COVER}
                shouldPlay={false}
                isLooping
                usePoster
                posterSource={{ uri: item.media[1] }}
                posterStyle={{ resizeMode: 'cover', height: '100%' }}
                source={{ uri: item.media[0] }}
            />
        </>
    )
})

export default PostSingle
