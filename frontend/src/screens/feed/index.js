import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, View } from 'react-native'
import useMaterialNavBarHeight from '../../hooks/useMaterialNavBarHeight'
import PostSingle from '../../components/general/post'
import { getFeed, getPostsByUserId } from '../../services/posts'
import styles from './styles'

export default function FeedScreen({ route }) {
    const { setCurrentUserProfileItemInView, creator, profile } = route.params
    const [posts, setPosts] = useState([])
    const mediaRefs = useRef({})

    useEffect(() => {
        const loadPosts = profile
            ? getPostsByUserId(creator)
            : getFeed()

        loadPosts.then(setPosts)
    }, [creator, profile])

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        const visibleKeys = new Set(
            viewableItems
                .filter(item => item.isViewable)
                .map(item => item.key)
        )

        Object.keys(mediaRefs.current).forEach(key => {
            const cell = mediaRefs.current[key]
            if (!cell) return

            if (visibleKeys.has(key)) {
                cell.play()
            } else {
                cell.stop()
            }
        })

        const focusedItem = viewableItems.find(item => item.isViewable)
        if (focusedItem && !profile) {
            setCurrentUserProfileItemInView(focusedItem.item.creator)
        }
    })

    const feedItemHeight = Dimensions.get('window').height - useMaterialNavBarHeight(profile)

    const renderItem = useCallback(({ item }) => (
        <View style={{ height: feedItemHeight, backgroundColor: 'black' }}>
            <PostSingle
                item={item}
                ref={cell => {
                    if (cell) mediaRefs.current[item.id] = cell
                    else delete mediaRefs.current[item.id]
                }}
            />
        </View>
    ), [feedItemHeight])

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                windowSize={5}
                initialNumToRender={2}
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 60,
                    waitForInteraction: false,
                    minimumViewTime: 100
                }}
                renderItem={renderItem}
                pagingEnabled
                snapToInterval={feedItemHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id}
                onViewableItemsChanged={onViewableItemsChanged.current}
            />
        </View>
    )
}
