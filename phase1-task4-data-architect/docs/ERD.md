# PlaceMux Core Database Entity Relationship Diagram (Task 4)

```mermaid
erDiagram
    TENANTS ||--o{ COLLEGES : owns
    COLLEGES ||--o{ STUDENTS : enrolls
    COLLEGES ||--o{ DRIVES : hosts
    COMPANIES ||--o{ JOBS : posts
    DRIVES ||--o{ JOBS : includes
    STUDENTS ||--o{ APPLICATIONS : submits
    JOBS ||--o{ APPLICATIONS : receives
    APPLICATIONS ||--o{ APPLICATION_HISTORY : tracks

    TENANTS {
        uuid id PK
        string name
        string slug UK
        timestamptz created_at
    }

    COLLEGES {
        uuid id PK
        uuid tenant_id FK
        string name
        string code UK
        timestamptz created_at
    }

    STUDENTS {
        uuid id PK
        uuid college_id FK
        string full_name
        string email UK
        numeric gpa
        int grad_year
        string status
        timestamptz created_at
    }

    COMPANIES {
        uuid id PK
        string name
        string domain
        string website
        timestamptz created_at
    }

    JOBS {
        uuid id PK
        uuid company_id FK
        uuid drive_id FK
        string title
        numeric min_gpa
        string status
        timestamptz created_at
    }

    APPLICATIONS {
        uuid id PK
        uuid job_id FK
        uuid student_id FK
        string status
        timestamptz applied_at
    }