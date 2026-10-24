
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  FlatList,
  SectionList,
  StyleSheet,
  StatusBar,
  Switch,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { WebView } from "react-native-webview";

const SCREEN_WIDTH = Dimensions.get("window").width;

const initialStudents = [
  { id: "1", name: "Rahul Sharma", roll: "101", present: true },
  { id: "2", name: "Priya Patil", roll: "102", present: true },
  { id: "3", name: "Amit Kumar", roll: "103", present: false },
  { id: "4", name: "Sneha Rao", roll: "104", present: true },
  { id: "5", name: "Arjun Singh", roll: "105", present: false },
];

function StatCard({ title, value, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

export default function App() {
  const [students, setStudents] = useState(initialStudents);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showReports, setShowReports] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(false);

  const animatedProgress = useRef(new Animated.Value(0)).current;

  const total = students.length;
  const present = students.filter((student) => student.present).length;
  const absent = total - present;
  const percentage = total
    ? Math.round((present / total) * 100)
    : 0;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage, animatedProgress]);

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.roll.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Present" && student.present) ||
      (filter === "Absent" && !student.present);

    return matchesSearch && matchesFilter;
  });

  const toggleAttendance = (id) => {
    setStudents((current) =>
      current.map((student) =>
        student.id === id
          ? { ...student, present: !student.present }
          : student
      )
    );
  };

  const addStudent = () => {
    const cleanName = name.trim();
    const cleanRoll = roll.trim();

    if (!cleanName || !cleanRoll) {
      Alert.alert(
        "Missing information",
        "Please enter both student name and roll number."
      );
      return;
    }

    const duplicateRoll = students.some(
      (student) =>
        student.roll.toLowerCase() === cleanRoll.toLowerCase()
    );

    if (duplicateRoll) {
      Alert.alert(
        "Duplicate roll number",
        "This roll number already exists. Please enter a unique roll number."
      );
      return;
    }

    setStudents((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        name: cleanName,
        roll: cleanRoll,
        present: false,
      },
    ]);

    setName("");
    setRoll("");
    setSearch("");
    setFilter("All");

    Alert.alert("Success", `${cleanName} has been added.`);
  };

  const deleteStudent = (student) => {
    const removeStudent = () => {
      setStudents((current) =>
        current.filter((item) => item.id !== student.id)
      );
    };

    Alert.alert(
      "Delete Student",
      `Are you sure you want to delete ${student.name} (Roll No: ${student.roll})?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: removeStudent,
        },
      ]
    );
  };

  const confirmDelete = (student) => {
    if (Platform.OS === "web") {
      if (
        typeof window !== "undefined" &&
        window.confirm(
          `Delete ${student.name} (Roll No: ${student.roll})?`
        )
      ) {
        setStudents((current) =>
          current.filter((item) => item.id !== student.id)
        );
      }
    } else {
      deleteStudent(student);
    }
  };

  const renderStudent = ({ item }) => (
    <View style={styles.studentRow}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.rollText}>Roll No: {item.roll}</Text>
      </View>

      <View style={styles.attendanceControl}>
        <Text
          style={{
            color: item.present ? "#15803D" : "#DC2626",
            fontWeight: "600",
          }}
        >
          {item.present ? "Present" : "Absent"}
        </Text>

        <Switch
          value={item.present}
          onValueChange={() => toggleAttendance(item.id)}
          trackColor={{
            false: "#FCA5A5",
            true: "#86EFAC",
          }}
          accessibilityLabel={`Attendance for ${item.name}`}
        />

        <View style={styles.deleteButton}>
          <Button
            title="Delete"
            color="#DC2626"
            onPress={() => confirmDelete(item)}
            accessibilityLabel={`Delete ${item.name}`}
          />
        </View>
      </View>
    </View>
  );

  const sections = [
    {
      title: "Present Students",
      data: filteredStudents.filter((student) => student.present),
    },
    {
      title: "Absent Students",
      data: filteredStudents.filter((student) => !student.present),
    },
  ];

  const showDashboard = () => {
    setShowReports(false);
    setShowHelp(false);
  };

  const showReportScreen = () => {
    setShowReports(true);
    setShowHelp(false);
  };

  const showHelpScreen = () => {
    setShowReports(false);
    setShowHelp(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#123A70"
        barStyle="light-content"
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Student Attendance
        </Text>
        <Text style={styles.headerSubtitle}>
          Attendance Management System
        </Text>
      </View>

      <View style={styles.navigation}>
        <View style={styles.navButton}>
          <Button title="Dashboard" onPress={showDashboard} />
        </View>

        <View style={styles.navButton}>
          <Button title="Reports" onPress={showReportScreen} />
        </View>

        <View style={styles.navButton}>
          <Button title="Help" onPress={showHelpScreen} />
        </View>
      </View>

      {showHelp ? (
        <WebView
          originWhitelist={["*"]}
          source={{
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body style="font-family:Arial,sans-serif;padding:24px;color:#123A70;line-height:1.7">
                  <h1>Student Attendance Help</h1>
                  <p>1. Add a student using their name and roll number.</p>
                  <p>2. Use the switch to mark a student present or absent.</p>
                  <p>3. Search by student name or roll number.</p>
                  <p>4. Select a filter to view specific attendance records.</p>
                  <p>5. Open Reports to view attendance statistics.</p>
                  <p>6. Click Delete to remove a student after confirmation.</p>
                </body>
              </html>
            `,
          }}
          style={styles.webView}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {showReports ? (
            <>
              <Text style={styles.pageTitle}>
                Attendance Reports
              </Text>

              <View style={styles.statsRow}>
                <StatCard
                  title="Total"
                  value={total}
                  color="#2563EB"
                />
                <StatCard
                  title="Present"
                  value={present}
                  color="#16A34A"
                />
                <StatCard
                  title="Absent"
                  value={absent}
                  color="#DC2626"
                />
              </View>

              <View style={styles.progressCard}>
                <Text style={styles.sectionTitle}>
                  Overall Attendance: {percentage}%
                </Text>

                <View style={styles.progressBackground}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      { width: progressWidth },
                    ]}
                  />
                </View>

                <Text style={styles.mutedText}>
                  {present} of {total} students present
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                Attendance by Status
              </Text>

              <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderStudent}
                renderSectionHeader={({ section }) => (
                  <Text style={styles.sectionHeader}>
                    {section.title} ({section.data.length})
                  </Text>
                )}
                renderSectionFooter={({ section }) =>
                  section.data.length === 0 ? (
                    <Text style={styles.emptyText}>
                      No students in this section.
                    </Text>
                  ) : null
                }
                scrollEnabled={false}
              />
            </>
          ) : (
            <>
              <Text style={styles.welcome}>
                Welcome, Administrator!
              </Text>

              <View style={styles.statsRow}>
                <StatCard
                  title="Total"
                  value={total}
                  color="#2563EB"
                />
                <StatCard
                  title="Present"
                  value={present}
                  color="#16A34A"
                />
                <StatCard
                  title="Absent"
                  value={absent}
                  color="#DC2626"
                />
              </View>

              <View style={styles.progressCard}>
                <Text style={styles.sectionTitle}>
                  Today's Attendance: {percentage}%
                </Text>

                <View style={styles.progressBackground}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      { width: progressWidth },
                    ]}
                  />
                </View>

                <Text style={styles.mutedText}>
                  {present} out of {total} students present
                </Text>
              </View>

              <Text style={styles.sectionTitle}>
                Add New Student
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter student name"
                value={name}
                onChangeText={setName}
                maxLength={80}
                accessibilityLabel="Student name"
              />

              <TextInput
                style={styles.input}
                placeholder="Enter roll number"
                value={roll}
                onChangeText={setRoll}
                maxLength={30}
                accessibilityLabel="Student roll number"
              />

              <View style={styles.addButton}>
                <Button
                  title="Add Student"
                  onPress={addStudent}
                />
              </View>

              <Text style={styles.sectionTitle}>
                Student List ({filteredStudents.length})
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Search name or roll number"
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Search students"
              />

              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={filter}
                  onValueChange={setFilter}
                  accessibilityLabel="Attendance filter"
                >
                  <Picker.Item
                    label="All Students"
                    value="All"
                  />
                  <Picker.Item
                    label="Present Only"
                    value="Present"
                  />
                  <Picker.Item
                    label="Absent Only"
                    value="Absent"
                  />
                </Picker>
              </View>

              <FlatList
                data={filteredStudents}
                renderItem={renderStudent}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    No students found.
                  </Text>
                }
              />

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color="#2563EB"
                  />
                  <Text style={styles.mutedText}>
                    Loading...
                  </Text>
                </View>
              ) : (
                <View style={styles.loadingButton}>
                  <Button
                    title="Demonstrate Loading Indicator"
                    onPress={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                      }, 1200);
                    }}
                  />
                </View>
              )}

              <Text style={styles.footer}>
                Student Attendance Application
              </Text>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  header: {
    backgroundColor: "#123A70",
    padding: 22,
    paddingTop: 32,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#DBEAFE",
    marginTop: 5,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 3,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#123A70",
    marginBottom: 12,
  },
  welcome: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#123A70",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 4,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  statValue: {
    fontSize: SCREEN_WIDTH < 360 ? 20 : 24,
    fontWeight: "bold",
    color: "#123A70",
    textAlign: "center",
  },
  statTitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 5,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#123A70",
    marginTop: 18,
    marginBottom: 12,
  },
  progressBackground: {
    height: 14,
    backgroundColor: "#DBEAFE",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16A34A",
    borderRadius: 10,
  },
  mutedText: {
    color: "#64748B",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
  },
  pickerBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginBottom: 12,
  },
  addButton: {
    marginBottom: 8,
  },
  studentRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    elevation: 1,
  },
  studentInfo: {
    flex: 1,
    minWidth: 0,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E293B",
  },
  rollText: {
    color: "#64748B",
    marginTop: 4,
  },
  attendanceControl: {
    alignItems: "center",
    gap: 4,
  },
  deleteButton: {
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#123A70",
    backgroundColor: "#DBEAFE",
    padding: 10,
    marginTop: 8,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    padding: 14,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 18,
  },
  loadingButton: {
    marginTop: 18,
  },
  footer: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 24,
  },
  webView: {
    flex: 1,
  },
});
