import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ErrorState from "../../components/shared/ErrorState";
import ImageWithFallback from "../../components/shared/ImageWithFallback";
import newsService from "../../services/newsService";
import { resolveAssetUrl } from "../../utils/assetUrl";

const { width, height } = Dimensions.get("window");
const HERO_HEIGHT = Platform.OS === "ios" ? height * 0.38 : height * 0.32;

/* ---------------- UI COMPONENTS ---------------- */

const MetaChip = ({ icon, text }) => (
    <View
        className="bg-white px-3.5 py-2 rounded-full flex-row items-center mr-2 mb-2 border border-gray-200"
        style={{
            shadowColor: "#000",
            shadowOpacity: 0.03,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
        }}
    >
        <Ionicons name={icon} size={13} color="#6B7280" />
        <Text className="text-gray-600 text-xs font-semibold ml-1.5">
            {text}
        </Text>
    </View>
);

const SummaryCard = ({ children, accentColor }) => (
    <View
        className="bg-white rounded-2xl px-6 py-5 mb-6"
        style={{
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
            borderLeftWidth: 5,
            borderLeftColor: accentColor || "#3B82F6",
        }}
    >
        <View className="flex-row mb-3">
            <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${accentColor}15` }}
            >
                <Ionicons name="information-circle" size={16} color={accentColor} />
            </View>
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider flex-1 mt-1.5">
                Resumen
            </Text>
        </View>
        {children}
    </View>
);

const ContentCard = ({ title, icon, children }) => (
    <View
        className="bg-white rounded-2xl px-6 py-5 mb-6"
        style={{
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
        }}
    >
        {title && (
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
                {icon && (
                    <Ionicons
                        name={icon}
                        size={18}
                        color="#374151"
                        style={{ marginRight: 8 }}
                    />
                )}
                <Text className="text-gray-700 font-bold text-xs uppercase tracking-widest">
                    {title}
                </Text>
            </View>
        )}
        {children}
    </View>
);

/* ---------------- SCREEN ---------------- */

export default function NewsDetailScreen() {
    const { id } = useLocalSearchParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadNews();
    }, [id]);

    const loadNews = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await newsService.getNewsById(id);
            setNews(response.data);
        } catch (err) {
            setError(err.message || "Error al cargar la noticia");
        } finally {
            setLoading(false);
        }
    };

    const formatRelativeDate = (dateString) => {
        const date = new Date(dateString);
        const diffHours = Math.floor((new Date() - date) / 36e5);
        if (diffHours < 1) return "Hace menos de 1 hora";
        if (diffHours < 24) return `Hace ${diffHours} h`;
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const colorMap = {
        alert: { bg: "#FEF2F2", text: "#DC2626", accent: "#EF4444" },
        update: { bg: "#EFF6FF", text: "#2563EB", accent: "#3B82F6" },
        success: { bg: "#F0FDF4", text: "#059669", accent: "#10B981" },
        prevention: { bg: "#FFFBEB", text: "#D97706", accent: "#F59E0B" },
        general: { bg: "#F9FAFB", text: "#4B5563", accent: "#6B7280" },
    };

    const categoryColors = colorMap[news?.category] || colorMap.general;

    if (loading) return null;

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-[#F9FAFB]">
                <ErrorState title="Error" message={error} onRetry={loadNews} />
            </SafeAreaView>
        );
    }

    if (!news) return null;

    return (
        <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={['top']}>
            {/* HEADER */}
            <View
                className="bg-white px-5 py-4 flex-row items-center"
                style={{
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 5,
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center mr-3 border border-gray-100"
                    accessibilityLabel="Volver"
                    activeOpacity={0.6}
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="flex-1">
                    <Text className="text-base font-black text-gray-900">
                        Noticia Policial
                    </Text>
                    <Text className="text-xs text-gray-400 font-medium mt-0.5">
                        Detalle completo
                    </Text>
                </View>
            </View>

            {/* CONTENT */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                <View className="px-5 pt-5 pb-10">
                    {/* HERO IMAGE */}
                    <View className="mb-5">
                        <View
                            className="overflow-hidden rounded-3xl"
                            style={{
                                height: HERO_HEIGHT,
                                backgroundColor: '#E5E7EB',
                            }}
                        >
                            <ImageWithFallback
                                uri={resolveAssetUrl(news.image)}
                                className="w-full h-full"
                                fallbackIcon="newspaper"
                                fallbackIconSize={56}
                                fallbackIconColor="#9CA3AF"
                            />
                            <LinearGradient
                                colors={["transparent", "rgba(0,0,0,0.5)"]}
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 120,
                                }}
                            />
                        </View>
                    </View>

                    {/* METADATA */}
                    <View className="flex-row flex-wrap mb-5">
                        <View
                            className="px-4 py-2.5 rounded-full mr-2 mb-2 border"
                            style={{
                                backgroundColor: categoryColors.bg,
                                borderColor: categoryColors.accent + '30',
                            }}
                        >
                            <Text
                                className="text-xs font-black uppercase tracking-wide"
                                style={{ color: categoryColors.text }}
                            >
                                {news.category}
                            </Text>
                        </View>
                        <MetaChip
                            icon="time-outline"
                            text={formatRelativeDate(news.publishedAt)}
                        />
                        <MetaChip
                            icon="eye-outline"
                            text={`${news.views || 0} vistas`}
                        />
                    </View>

                    {/* TITLE */}
                    <View className="mb-6">
                        <Text
                            className="text-[28px] font-black text-gray-900 mb-2"
                            style={{
                                lineHeight: 36,
                                letterSpacing: -0.5,
                            }}
                        >
                            {news.title}
                        </Text>
                    </View>

                    {/* SUMMARY */}
                    {news.summary && (
                        <SummaryCard accentColor={categoryColors.accent}>
                            <Text
                                className="text-gray-700 font-medium"
                                style={{
                                    fontSize: 15.5,
                                    lineHeight: 24,
                                    letterSpacing: 0.2,
                                }}
                            >
                                {news.summary}
                            </Text>
                        </SummaryCard>
                    )}

                    {/* MAIN CONTENT */}
                    <ContentCard title="Descripción Detallada" icon="document-text">
                        <Text
                            className="text-gray-800"
                            style={{
                                fontSize: 15,
                                lineHeight: 26,
                                letterSpacing: 0.15,
                            }}
                        >
                            {news.content}
                        </Text>
                    </ContentCard>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
