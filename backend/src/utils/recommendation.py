import pandas as pd
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from src.dals.assignment_dal import get_user_task_interactions
from src.dals.task_dal import get_task_metadata

def train_collaborative_filtering(interactions):
    """
    Train a collaborative filtering model using SVD.
    """
    # Create a user-task interaction matrix
    df = pd.DataFrame(interactions, columns=["user_id", "task_id"])
    df["interaction"] = 1  # Binary interaction (signed up or completed)
    user_task_matrix = df.pivot(index="user_id", columns="task_id", values="interaction").fillna(0)

    # Train SVD model
    svd = TruncatedSVD(n_components=10)
    user_factors = svd.fit_transform(user_task_matrix)
    task_factors = svd.components_

    return user_task_matrix, user_factors, task_factors

def train_content_based_filtering(task_metadata):
    """
    Train a content-based filtering model using TF-IDF.
    """
    df = pd.DataFrame(task_metadata, columns=["task_id", "task_name", "task_type", "description"])
    df["combined_features"] = df["task_name"] + " " + df["task_type"] + " " + df["description"]

    # Compute TF-IDF matrix
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(df["combined_features"])

    # Compute cosine similarity
    similarity_matrix = cosine_similarity(tfidf_matrix)

    return df, similarity_matrix

def recommend_tasks_for_user(user_id):
    """
    Hybrid recommendation system for recommending tasks to a user.
    """
    try:
        # Fetch all user-task interactions
        interactions = get_user_task_interactions()
        task_metadata = get_task_metadata()

        # Train collaborative filtering model
        user_task_matrix, user_factors, task_factors = train_collaborative_filtering(interactions)

        # Check if the user exists in the interaction matrix
        if user_id in user_task_matrix.index:
            # Collaborative filtering for users with history
            user_index = user_task_matrix.index.get_loc(user_id)
            user_vector = user_factors[user_index]
            task_scores = user_vector @ task_factors
            recommended_task_indices = task_scores.argsort()[::-1][:5]
            recommended_tasks = user_task_matrix.columns[recommended_task_indices]
        else:
            # Content-based filtering for new users
            task_df, similarity_matrix = train_content_based_filtering(task_metadata)
            recommended_task_indices = similarity_matrix.mean(axis=0).argsort()[::-1][:5]
            recommended_tasks = task_df.iloc[recommended_task_indices]["task_id"]

        # Return recommended tasks
        return [{"task_id": task_id} for task_id in recommended_tasks]

    except Exception as e:
        print(f"Error in hybrid recommendation system: {e}")
        return []
