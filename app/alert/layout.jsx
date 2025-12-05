// app/alert/_layout.jsx
import { Stack } from "expo-router";


export default function AlertLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false }}>
       <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
